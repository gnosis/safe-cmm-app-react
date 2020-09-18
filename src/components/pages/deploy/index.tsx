import React, { useMemo } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";

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

export function DeployPage(): JSX.Element {
  // input states
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);

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

  const viewerProps: Props = useMemo(() => ({ onSubmit }), [onSubmit]);

  return <DeployPageViewer {...viewerProps} />;
}
