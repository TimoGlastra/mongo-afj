import { Agent, InjectionSymbols } from "@aries-framework/core";
import { MongoStorageModule } from "./MongoStorageModule";
import { AskarModule } from "@aries-framework/askar";
import { agentDependencies } from "@aries-framework/node";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

const agent = new Agent({
  dependencies: agentDependencies,
  config: {
    label: "test",
    walletConfig: {
      id: "test",
      key: "test",
    },
  },
  modules: {
    askar: new AskarModule({
      ariesAskar,
    }),
    mongo: new MongoStorageModule(),
  },
});

async function run() {
  await agent.initialize();
  console.log("Agent initialized");
  const storageService = agent.dependencyManager.resolve(
    InjectionSymbols.StorageService
  );
  await agent.genericRecords.save({
    content: { name: "timo" },
    tags: {
      name: "timo",
    },
  });
  console.log(await agent.genericRecords.getAll());
  console.log(
    await agent.genericRecords.findAllByQuery({
      name: "timo",
    })
  );
}

run();
