import { useTokenDetails as hook } from "hooks/useTokenDetails";
import { TokenDetails } from "../types";

import { mockTokenDetails } from "./data";

export const useTokenDetails: typeof hook = (
  token: string | TokenDetails
): any => {
  let tokenDetails: null | TokenDetails;

  if (!token) {
    tokenDetails = null;
  } else if (typeof token === "string") {
    tokenDetails = mockTokenDetails[token] || {
      decimals: 18,
      name: "same",
      symbol: "TKN",
      address: token,
    };
  } else {
    tokenDetails = token;
  }
  return tokenDetails;
};
