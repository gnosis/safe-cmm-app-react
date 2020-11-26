import Decimal from "decimal.js";
import { TokenDetails } from "types";
import { decimalFormat } from "utils/decimalFormat";

describe("decimalFormat", () => {
  const fakeToken = {
    symbol: "TEST",
    address: "0x123",
    name: "Test Tokens",
  } as TokenDetails;

  test("it formats >smallest decimal correctly", () => {
    expect(decimalFormat(new Decimal(123), fakeToken)).toBe("123 TEST");
    expect(decimalFormat(new Decimal(-123), fakeToken)).toBe("-123 TEST");
    expect(decimalFormat(new Decimal(0), fakeToken)).toBe("0 TEST");
    expect(decimalFormat(new Decimal(123))).toBe("123");
  });

  test("it formats <smallest decimal correctly", () => {
    expect(decimalFormat(new Decimal(0.0001), fakeToken)).toBe("0.0001 TEST");
    expect(decimalFormat(new Decimal(0.00001), fakeToken)).toBe("<0.0001 TEST");
    expect(decimalFormat(new Decimal(-0.0001), fakeToken)).toBe("-0.0001 TEST");
    expect(decimalFormat(new Decimal(-0.00001), fakeToken)).toBe(
      ">-0.0001 TEST"
    );
  });
});
