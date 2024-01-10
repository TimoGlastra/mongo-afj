import {
  AgentContext,
  DependencyManager,
  InjectionSymbols,
  Module,
  StorageVersionRecord,
} from "@aries-framework/core";
import { MongoStorageService } from "./MongoStorageService";
import { MongoClient, ServerApiVersion } from "mongodb";

export class MongoStorageModule implements Module {
  public readonly client = new MongoClient("mongodb://localhost:27017", {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  register(dependencyManager: DependencyManager): void {
    dependencyManager.registerSingleton(
      InjectionSymbols.StorageService,
      MongoStorageService
    );
  }

  async initialize(agentContext: AgentContext): Promise<void> {
    await this.client.connect();
    console.log("connected");
  }
}
