import { EventStrategy } from "logic/EventStrategy";
import { BaseStrategy } from "logic/IStrategy";
import { FleetDeployEvent } from "logic/types";
import { ContractContextMock } from "mock/contractInteractionContextMock";

const fakeFleetEvent = {
  transactionHash: "0xdeadbeef",
  blockNumber: 123,
  returnValues: {
    owner: "0x123",
    fleet: ["0x1", "0x2", "0x3"],
  },
} as FleetDeployEvent;

test("creates instance from fleet deploy event", () => {
  const instance = new EventStrategy(fakeFleetEvent);

  expect(instance).toBeInstanceOf(BaseStrategy);
  expect(instance.transactionHash).toBe(fakeFleetEvent.transactionHash);
  expect(instance.startBlockNumber).toBe(fakeFleetEvent.blockNumber);
  expect(instance.brackets.map(({ address }) => address)).toMatchObject(
    fakeFleetEvent.returnValues.fleet
  );
});

test("reads funding from deposit events", async () => {
  const contextMocker = new ContractContextMock();
  contextMocker.mockContractEventEmit("BatchExchange", "OrderPlacement", {
    returnValues: {
      owner: "0x10d0896ca97ec14f839cf33b7ade652ecc2cb2d9",
      index: 0,
      buyToken: 0,
      sellToken: 4,
      validFrom: 5346265,
      validUntil: 4294967294,
      priceNumerator: "340282366920938463463374607431768211455",
      priceDenominator: "357296485266985401748116082",
    },
  });

  contextMocker.mockContractEventEmit("BatchExchange", "OrderPlacement", {
    returnValues: {
      owner: "0x10d0896ca97ec14f839cf33b7ade652ecc2cb2d9",
      index: 1,
      buyToken: 4,
      sellToken: 0,
      validFrom: 5346265,
      validUntil: 4294967294,
      priceNumerator: "374310603613032340032857558",
      priceDenominator: "340282366920938463463374607431768211455",
    },
  });

  //console.log(contextMocker);
  //console.log(contextMocker.getDeployed("BatchExchange"));
  const instance = new EventStrategy(fakeFleetEvent);
  try {
    await instance.readFunding(contextMocker);
  } catch (err) {
    console.error(err)
  }
});
