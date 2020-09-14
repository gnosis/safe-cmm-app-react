import { useTokenDetails as hook } from "hooks/useTokenDetails";
import { mockTokenDetails } from "./data";

export const useTokenDetails: typeof hook = (token) => {
  if (!token) {
    return null;
  }
  if (typeof token === "string") {
    return (
      mockTokenDetails[token] || {
        decimals: 18,
        name: "same",
        symbol: "TKN",
        address: token,
      }
    );
  }
  return token;
};
