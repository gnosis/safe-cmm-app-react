import { atom } from "recoil";

export const baseTokenAddressAtom = atom({
  key: "baseTokenAddress",
  default: "",
});
export const quoteTokenAddressAtom = atom({
  key: "quoteTokenAddress",
  default: "",
});
export const lowestPriceAtom = atom({ key: "lowestPrice", default: "" });
export const startPriceAtom = atom({ key: "startPrice", default: "" });
export const highestPriceAtom = atom({ key: "highestPrice", default: "" });
export const baseTokenAmountAtom = atom({
  key: "baseTokenAmount",
  default: "",
});
export const quoteTokenAmountAtom = atom({
  key: "quoteTokenAmount",
  default: "",
});
export const totalBracketsAtom = atom({ key: "totalBrackets", default: "" });
export const baseTokenBracketsAtom = atom({
  key: "baseTokenBrackets",
  default: 0,
});
export const quoteTokenBracketsAtom = atom({
  key: "quoteTokenBrackets",
  default: 0,
});
export const totalInvestmentAtom = atom({
  key: "totalInvestment",
  default: "",
});

export const isSubmittingAtom = atom({ key: "isSubmitting", default: false });
export const errorAtom = atom<null | { label: string; body: string }>({
  key: "error",
  default: null,
});
