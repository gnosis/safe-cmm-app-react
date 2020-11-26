import { selector } from "recoil";

import { tokenDetailsState } from "./atoms";

export const tokenListState = selector({
  key: "tokenList",
  get: ({ get }) => {
    const tokenDetails = get(tokenDetailsState);

    return Object.values(tokenDetails);
  },
});

export const usdReferenceTokenState = selector({
  key: "usdReferenceToken",
  get: ({ get }) => {
    const tokenList = get(tokenListState);

    return tokenList.find(({ symbol }) => symbol === "USDC") || null;
  },
});
