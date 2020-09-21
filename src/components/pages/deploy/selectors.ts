import { selector } from "recoil";
import {
  baseTokenAddressAtom,
  baseTokenAmountAtom,
  errorAtom,
  highestPriceAtom,
  lowestPriceAtom,
  quoteTokenAddressAtom,
  quoteTokenAmountAtom,
  startPriceAtom,
  totalBracketsAtom,
} from "./atoms";

// TODO: refactor this type, it's dumb
import { Props as MessageProps } from "components/basic/display/Message";

export const messagesSelector = selector({
  key: "messages",
  get: ({ get }): null | MessageProps[] => {
    const error = get(errorAtom);

    return (
      error && [
        {
          type: "error",
          label: error.label,
          children: error.body,
        },
      ]
    );
  },
});

// TODO: dumb validation. Replace when doing real validation
export const isValidSelector = selector({
  key: "isValid",
  get: ({ get }): boolean => {
    return [
      get(baseTokenAddressAtom),
      get(quoteTokenAddressAtom),
      get(startPriceAtom),
      get(lowestPriceAtom),
      get(highestPriceAtom),
      get(baseTokenAmountAtom),
      get(quoteTokenAmountAtom),
      get(totalBracketsAtom),
    ].every(Boolean);
  },
});

export const baseTokenBracketsSelector = selector({
  key: "baseTokenBrackets",
  get: ({ get }): number => {
    const brackets = Number(get(totalBracketsAtom));

    if (brackets >= 1) {
      return Math.ceil(brackets / 2);
    } else {
      return 0;
    }
  },
});

export const quoteTokenBracketsSelector = selector({
  key: "quoteTokenBrackets",
  get: ({ get }): number => {
    const brackets = Number(get(totalBracketsAtom));

    if (brackets >= 1) {
      return Math.floor(brackets / 2);
    } else {
      return 0;
    }
  },
});
