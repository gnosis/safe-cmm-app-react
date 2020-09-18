import React, { useMemo } from "react";
import {
  RecoilState,
  useRecoilCallback,
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
  errorAtom,
  isSubmittingAtom,
} from "./atoms";

import { DeployPageViewer, Props } from "./viewer";
import { isValidSelector } from "./selectors";

const onChangeHandlerFactory = (
  setter: React.Dispatch<React.SetStateAction<string>>
) => (event: React.ChangeEvent<HTMLInputElement>): void => {
  setter(event.target.value);
};

export function DeployPage(): JSX.Element {
  // input states
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);
  const setLowestPrice = useSetRecoilState(lowestPriceAtom);
  const setStartPrice = useSetRecoilState(startPriceAtom);
  const setHighestPrice = useSetRecoilState(highestPriceAtom);
  const setBaseTokenAmount = useSetRecoilState(baseTokenAmountAtom);
  const setQuoteTokenAmount = useSetRecoilState(quoteTokenAmountAtom);
  const setTotalBrackets = useSetRecoilState(totalBracketsAtom);

  const deployStrategy = useDeployStrategy({
    baseTokenAddress,
    quoteTokenAddress,
  });

  const onSubmit = useRecoilCallback(
    ({ snapshot, set }) => async (
      event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
      // TODO: move on to another page/show success message
      event.preventDefault();

      const isValid = await snapshot.getPromise(isValidSelector);

      if (isValid) {
        set(isSubmittingAtom, true);
        set(errorAtom, null);

        try {
          // Fetch state values from snapshot
          const [
            lowestPrice,
            highestPrice,
            baseTokenAmount,
            quoteTokenAmount,
            totalBrackets,
            startPrice,
          ] = await Promise.all([
            snapshot.getPromise(lowestPriceAtom),
            snapshot.getPromise(highestPriceAtom),
            snapshot.getPromise(baseTokenAmountAtom),
            snapshot.getPromise(quoteTokenAmountAtom),
            snapshot.getPromise(totalBracketsAtom),
            snapshot.getPromise(startPriceAtom),
          ]);

          await deployStrategy({
            lowestPrice,
            highestPrice,
            baseTokenAmount,
            quoteTokenAmount,
            totalBrackets,
            startPrice,
          });
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
      onTotalBracketsChange: onChangeHandlerFactory(setTotalBrackets),
      onSubmit,
    }),
    [onSubmit]
  );

  return <DeployPageViewer {...viewerProps} />;
}
