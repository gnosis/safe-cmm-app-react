import { BaseStrategy } from "logic/IStrategy";
import { SafeStrategy } from "logic/SafeStrategy";
import { FakeStateManager } from "mock/stateManager";

import safeTxData from "./safeTx.json";

test("creates instance from valid tx log", () => {
  const stateManager = new FakeStateManager();
  const instance = new SafeStrategy(safeTxData, stateManager.makeUpdater());

  expect(instance).toBeInstanceOf(BaseStrategy);

  expect(instance.transactionHash).toBe(
    "0xe1a0cc52d0dcbd89ded5ac4ec094245d09243492f80990b26fdaf776da3c7818"
  );
  expect(instance.created.toISOString()).toMatch("2020-10-29T10:30:51.399Z");
  expect(instance.nonce).toBe(133);
});
