import { EventStrategy } from "logic/EventStrategy";
import { BaseStrategy } from "logic/IStrategy";
import { FleetDeployEvent } from "logic/types";
import { ContractContextMock } from "mock/contractInteractionContextMock";
import { FakeStateManager } from "mock/stateManager";
import { StrategyState } from "types";

const fakeFleetEvent = {
  transactionHash: "0xdeadbeef",
  blockNumber: 123,
  returnValues: {
    owner: "0x123",
    fleet: ["0x1", "0x2", "0x3"],
  },
} as FleetDeployEvent;

test("creates instance from fleet deploy event", () => {
  const stateManager = new FakeStateManager();
  const instance = new EventStrategy(
    fakeFleetEvent,
    stateManager.makeUpdater()
  );

  expect(instance).toBeInstanceOf(BaseStrategy);
  expect(instance.transactionHash).toBe(fakeFleetEvent.transactionHash);
  expect(instance.startBlockNumber).toBe(fakeFleetEvent.blockNumber);
  expect(instance.brackets.map(({ address }) => address)).toMatchObject(
    fakeFleetEvent.returnValues.fleet
  );
});

test("reads funding from deposit events", async () => {
  const contextMocker = new ContractContextMock();

  // events taken from rinkeby 0xd2ef12ac789cf5a9f88f3c48e4a4d02cc70f0ccfc9e3e8147ac683ba8565886f
  const fleetEvent = {
    transactionHash:
      "0xd2ef12ac789cf5a9f88f3c48e4a4d02cc70f0ccfc9e3e8147ac683ba8565886f",
    blockNumber: 7448118,
    returnValues: {
      owner: "0x3f493de0d70c437930cf7ab1269a581a1d19175d",
      fleet: ["0x10d0896ca97ec14f839cf33b7ade652ecc2cb2d9"],
    },
  };

  const addrMap = {
    4: "0x9187a7788410f54a630407fa994c1555722f9abc", // USDC?
    0: "0x0000000000085d4780b73119b644ae5ecd22b376", // OWL?
  };
  contextMocker.mockContractMethodReturn(
    "BatchExchange",
    "tokenIdToAddressMap",
    (id) => {
      return addrMap[id];
    }
  );

  contextMocker.mockContractEventEmit("BatchExchange", "OrderPlacement", {
    owner: "0x10d0896ca97ec14f839cf33b7ade652ecc2cb2d9",
    index: 0,
    buyToken: 0,
    sellToken: 4,
    validFrom: 5346265,
    validUntil: 4294967294,
    priceNumerator: "340282366920938463463374607431768211455",
    priceDenominator: "357296485266985401748116082",
  });

  contextMocker.mockContractEventEmit("BatchExchange", "OrderPlacement", {
    owner: "0x10d0896ca97ec14f839cf33b7ade652ecc2cb2d9",
    index: 1,
    buyToken: 4,
    sellToken: 0,
    validFrom: 5346265,
    validUntil: 4294967294,
    priceNumerator: "374310603613032340032857558",
    priceDenominator: "340282366920938463463374607431768211455",
  });

  contextMocker.mockContractEventEmit("BatchExchange", "Deposit", {
    user: "0x10d0896ca97ec14f839cf33b7ade652ecc2cb2d9",
    token: "0x9187a7788410f54a630407fa994c1555722f9abc",
    amount: "400000000000000000000",
    batchId: 5346265,
  });

  const stateManager = new FakeStateManager();
  const instance = new EventStrategy(
    fleetEvent,
    stateManager.makeUpdater(fleetEvent.transactionHash)
  );
  try {
    await instance.readFunding(contextMocker);

    const state = stateManager.state[fleetEvent.transactionHash];

    // Token finding mapping
    expect(state.baseToken.address).toBe(addrMap[0]);

    expect(state.quoteToken.address).toBe(addrMap[4]);

    expect(state.priceRange.lower.toNumber()).toBeCloseTo(1.05e-12);
    expect(state.priceRange.upper.toNumber()).toBeCloseTo(1.1e-12);

    // token details should match completely
    expect(state.priceRange.token).toBe(state.quoteToken);
  } catch (err) {
    console.error(err);
  }
});
