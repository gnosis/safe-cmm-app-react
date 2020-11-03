import Strategy from "logic/strategy";

import { FleetDeployEvent } from "logic/types";

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
    const fakePendingStrategyTransaction = {
      safeTxHash: "0xdeadbeef",
      nonce: 123,
      submissionDate: "2020-10-30T11:32:12.929Z",
      dataDecoded: {
        method: "notReallyAMethod",
        parameters: [
          {
            name: "transactions",
            type: "bytes",
            value: "0x12345678",
            valueDecoded: [],
          },
        ],
      },
    };

    const instance = Strategy.fromSafeTx(fakePendingStrategyTransaction);
    expect(instance).toBeInstanceOf(Strategy);
    expect(instance.transactionHash).toBe(
      fakePendingStrategyTransaction.safeTxHash
    );
  });
});
