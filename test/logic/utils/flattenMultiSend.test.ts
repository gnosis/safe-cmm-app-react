import { filter } from "lodash";
import { flattenMultiSend } from "logic/utils/flattenMultiSend";

import safeTx from "../safeTx.json";
const multiSendTxData = safeTx.dataDecoded;

describe("flattenMultiSend function", () => {
  test("rejects non MultiSend transactions", () => {
    const nonMultiSendTxData = {
      method: "subtract",
      parameters: [
        {
          name: "a",
          type: "int256",
          value: 1,
        },
        {
          name: "b",
          type: "int256",
          value: 5,
        },
      ],
    };

    expect(() => {
      flattenMultiSend(nonMultiSendTxData);
    }).toThrow("Can only flatten multiSend transactions");
  });

  test("finds correct amount of method calls in transaction", () => {
    const methodCalls = flattenMultiSend(multiSendTxData);

    expect(filter(methodCalls, { method: "transfer" })).toHaveLength(8);
    expect(filter(methodCalls, { method: "deposit" })).toHaveLength(8);
    expect(filter(methodCalls, { method: "placeOrder" })).toHaveLength(16);
    expect(
      filter(methodCalls, { method: "deployFleetWithNonce" })
    ).toHaveLength(1);
  });

  test("matches correct parent value to determine target contract", () => {
    const methodCalls = flattenMultiSend(multiSendTxData);

    const owlContractAddr = "0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D";
    const fleetFactoryAddr = "0x6b7aaDEE3F3060c52F1c5Afcfc2F4d25554af3e5";

    // target on transfers is token contract
    expect(filter(methodCalls, { method: "transfer" })[0].target).toBe(
      owlContractAddr
    );

    // target on deploy fleet is deploy fleet contract
    expect(
      filter(methodCalls, { method: "deployFleetWithNonce" })[0].target
    ).toBe(fleetFactoryAddr);

    const firstBracketAddr = "0xcc42a81caf6DA6c5fee344630253B6519F929a4a";

    expect(filter(methodCalls, { method: "placeOrder" })[0].target).toBe(
      firstBracketAddr
    );
  });

  test("reads params correctly", () => {
    const methodCalls = flattenMultiSend(multiSendTxData);

    expect(filter(methodCalls, { method: "deposit" })[0].params).toMatchObject({
      token: "0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D",
      amount: "25000000000000000",
    });
  });
});
