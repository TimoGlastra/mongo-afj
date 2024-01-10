import {
  AgentContext,
  BaseRecord,
  BaseRecordConstructor,
  JsonTransformer,
  Query,
  RecordNotFoundError,
  StorageService,
  StorageVersionRecord,
} from "@aries-framework/core";
import { MongoStorageModule } from "./MongoStorageModule";

export class MongoStorageService<T extends BaseRecord>
  implements StorageService<T>
{
  private getCollectionForRecordType(agentContext: AgentContext, type: string) {
    const module = agentContext.dependencyManager.registeredModules
      .mongo as MongoStorageModule;

    return module.client.db("afj").collection(type);
  }

  async save(agentContext: AgentContext, record: T): Promise<void> {
    console.log("save");
    const collection = this.getCollectionForRecordType(
      agentContext,
      record.type
    );

    const jsonRecord = record.toJSON();
    jsonRecord._id = jsonRecord.id;
    delete jsonRecord.id;
    jsonRecord._tags = record.getTags();
    await collection.insertOne(jsonRecord);
  }

  update(agentContext: AgentContext, record: T): Promise<void> {
    throw new Error("Method not implemented.");
  }
  delete(agentContext: AgentContext, record: T): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public async getById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<T> {
    console.log("getById");
    if (id === "STORAGE_VERSION_RECORD_ID") {
      return new StorageVersionRecord({
        id: "STORAGE_VERSION_RECORD_ID",
        storageVersion: "0.4",
      }) as unknown as T;
    }

    const collection = this.getCollectionForRecordType(
      agentContext,
      recordClass.type
    );

    const record: Record<string, unknown> | null = await collection.findOne({
      // @ts-ignore
      _id: id,
    });
    if (!record) {
      throw new RecordNotFoundError("not found", {
        recordType: recordClass.type,
      });
    }
    return this.transformRecord(record, recordClass);
  }

  private transformRecord(
    record: Record<string, unknown>,
    recordClass: BaseRecordConstructor<T>
  ) {
    record.id = record._id;
    delete record._id;
    return JsonTransformer.fromJSON(record, recordClass);
  }

  async getAll(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    const collection = this.getCollectionForRecordType(
      agentContext,
      recordClass.type
    );
    console.log("getAll");
    const records = await collection.find({}).toArray();
    return records.map((doc) => this.transformRecord(doc, recordClass));
  }
  async findByQuery(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    query: Query<T>
  ): Promise<T[]> {
    const collection = this.getCollectionForRecordType(
      agentContext,
      recordClass.type
    );
    console.log(query);
    const records = await collection
      .find({
        _tags: query,
      })
      .toArray();
    return records.map((doc) => this.transformRecord(doc, recordClass));
  }
}
