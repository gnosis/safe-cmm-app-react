import Strategy from "logic/strategy";

import { FleetDeployEvent } from "logic/types";
import safeTxData from "./safeTx.json";

describe("Strategy class", () => {
  test("creates instance from fleet deploy event", () => {
    const fakeFleetEvent = {
      transactionHash: "0xdeadbeef",
      blockNumber: 123,
      returnValues: {
        owner: "0x123",
        fleet: ["0x1", "0x2", "0x3"],
      },
    } as FleetDeployEvent;

    const instance = Strategy.fromFleetDeployEvent(fakeFleetEvent);

    expect(instance).toBeInstanceOf(Strategy);
    expect(instance.transactionHash).toBe(fakeFleetEvent.transactionHash);
  });

  test("creates instance from safe pending transaction", () => {
    const instance = Strategy.fromSafeTx(safeTxData);
    expect(instance).toBeInstanceOf(Strategy);
    expect(instance.transactionHash).toBe(safeTxData.safeTxHash);
  });

  test("it reads funding from safe tx log", () => {
    const instance = Strategy.fromSafeTx(safeTxData);
    expect(instance.status).toBe("PENDING");
    expect(instance.baseFundingWei.toString()).toBe("0");
    expect(instance.quoteFundingWei.toString()).toBe("0.1");
  });
});
