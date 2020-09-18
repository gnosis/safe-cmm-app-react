import React, { useEffect, useMemo } from "react";
import {
  RecoilState,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import { useDeployStrategy } from "hooks/useDeployStrategy";

import {
  baseTokenAddressAtom,
  quoteTokenAddressAtom,
  lowestPriceAtom,
  startPriceAtom,
  highestPriceAtom,
  baseTokenAmountAtom,
  quoteTokenAmountAtom,
  totalBracketsAtom,
  baseTokenBracketsAtom,
  quoteTokenBracketsAtom,
  errorAtom,
  isSubmittingAtom,
} from "./atoms";

import { DeployPageViewer, Props } from "./viewer";

const onChangeHandlerFactory = (
  setter: React.Dispatch<React.SetStateAction<string>>
) => (event: React.ChangeEvent<HTMLInputElement>): void => {
  setter(event.target.value);
};

export function DeployPage(): JSX.Element {
  // input states
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);
  const [lowestPrice, setLowestPrice] = useRecoilState(lowestPriceAtom);
  const [startPrice, setStartPrice] = useRecoilState(startPriceAtom);
  const [highestPrice, setHighestPrice] = useRecoilState(highestPriceAtom);
  const [baseTokenAmount, setBaseTokenAmount] = useRecoilState(
    baseTokenAmountAtom
  );
  const [quoteTokenAmount, setQuoteTokenAmount] = useRecoilState(
    quoteTokenAmountAtom
  );
  const totalBrackets = useRecoilValue(totalBracketsAtom);

  const deployStrategy = useDeployStrategy({
    lowestPrice,
    highestPrice,
    baseTokenAmount,
    quoteTokenAmount,
    totalBrackets,
    baseTokenAddress,
    quoteTokenAddress,
    startPrice,
  });

  const onSubmit = useRecoilCallback(
    ({ set }) => async (
      event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
      // TODO: move on to another page/show success message
      event.preventDefault();

      if (deployStrategy) {
        set(isSubmittingAtom, true);
        set(errorAtom, null);
        try {
          await deployStrategy();
        } catch (e) {
          console.error(`Failed to deploy strategy:`, e);
          set(errorAtom, {
            label: "Failed to deploy strategy",
            body: e.message,
          });
        }
        set(isSubmittingAtom, false);
      }
    },
    [deployStrategy]
  );

  const onTotalBracketsChange = useRecoilCallback(
    ({ set }) => (event: React.ChangeEvent<HTMLInputElement>): void => {
      set(totalBracketsAtom, event.target.value);

      const brackets = +event.target.value;

      // TODO: find out how to properly split brackets when uneven
      if (brackets >= 1) {
        if (brackets % 2 === 0) {
          set(baseTokenBracketsAtom, brackets / 2);
          set(quoteTokenBracketsAtom, brackets / 2);
        } else {
          set(baseTokenBracketsAtom, Math.ceil(brackets / 2));
          set(quoteTokenBracketsAtom, Math.floor(brackets / 2));
        }
      } else {
        set(baseTokenBracketsAtom, 0);
        set(quoteTokenBracketsAtom, 0);
      }
    },
    []
  );

  const swapTokens = useRecoilCallback(({ snapshot, set }) => async (): Promise<
    void
  > => {
    const [currBase, currQuote] = await Promise.all([
      snapshot.getPromise(baseTokenAddressAtom),
      snapshot.getPromise(quoteTokenAddressAtom),
    ]);
    set(quoteTokenAddressAtom, currBase);
    set(baseTokenAddressAtom, currQuote);
  });

  const onSelectTokenFactory = useRecoilCallback(
    ({ snapshot, set }) => (
      currentSelectAtom: RecoilState<string>,
      oppositeSelectAtom: RecoilState<string>
    ) => async (address: string): Promise<void> => {
      const oppositeValue = await snapshot.getPromise(oppositeSelectAtom);

      if (address === oppositeValue) {
        swapTokens();
      } else {
        set(currentSelectAtom, address);
      }
    }
  );

  const viewerProps: Props = useMemo(
    () => ({
      swapTokens,
      onBaseTokenSelect: onSelectTokenFactory(
        baseTokenAddressAtom,
        quoteTokenAddressAtom
      ),
      onQuoteTokenSelect: onSelectTokenFactory(
        quoteTokenAddressAtom,
        baseTokenAddressAtom
      ),
      onLowestPriceChange: onChangeHandlerFactory(setLowestPrice),
      onStartPriceChange: onChangeHandlerFactory(setStartPrice),
      onHighestPriceChange: onChangeHandlerFactory(setHighestPrice),
      onBaseTokenAmountChange: onChangeHandlerFactory(setBaseTokenAmount),
      onQuoteTokenAmountChange: onChangeHandlerFactory(setQuoteTokenAmount),
      onTotalBracketsChange,
      onSubmit: deployStrategy && onSubmit,
    }),
    [deployStrategy, onSubmit]
  );

  return <DeployPageViewer {...viewerProps} />;
}
