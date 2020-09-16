import React, { useCallback, useState } from "react";

import { useDeployStrategy } from "hooks/useDeployStrategy";

import { DeployPageViewer, Props } from "./viewer";

// TODO: fix type
const onChangeHandlerFactory = (
  setter: React.Dispatch<React.SetStateAction<string>>
) => (event: React.ChangeEvent<HTMLInputElement>): void => {
  setter(event.target.value);
};

export function DeployPage(): JSX.Element {
  // input states
  const [baseTokenAddress, setBaseTokenAddress] = useState("");
  const [quoteTokenAddress, setQuoteTokenAddress] = useState("");
  const [lowestPrice, setLowestPrice] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [highestPrice, setHighestPrice] = useState("");
  const [baseTokenAmount, setBaseTokenAmount] = useState("");
  const [quoteTokenAmount, setQuoteTokenAmount] = useState("");
  const [totalBrackets, setTotalBrackets] = useState("");
  // display states
  const [baseTokenBrackets, setBaseTokenBrackets] = useState(0);
  const [quoteTokenBrackets, setQuoteTokenBrackets] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState("");
  // error handling
  const [error, setError] = useState<{ label: string; body: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      // TODO: move on to another page/show success message
      event.preventDefault();

      if (deployStrategy) {
        setIsSubmitting(true);
        setError(null);
        try {
          await deployStrategy();
        } catch (e) {
          console.error(`Failed to deploy strategy:`, e);
          setError({ label: "Failed to deploy strategy", body: e.message });
        }
        setIsSubmitting(false);
      }
    },
    [deployStrategy]
  );

  const onTotalBracketsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setTotalBrackets(event.target.value);

      const brackets = +event.target.value;

      // TODO: find out how to properly split brackets when uneven
      if (brackets >= 1) {
        if (brackets % 2 === 0) {
          setBaseTokenBrackets(brackets / 2);
          setQuoteTokenBrackets(brackets / 2);
        } else {
          setBaseTokenBrackets(Math.ceil(brackets / 2));
          setQuoteTokenBrackets(Math.floor(brackets / 2));
        }
      } else {
        setBaseTokenBrackets(0);
        setQuoteTokenBrackets(0);
      }
    },
    []
  );

  const swapTokens = useCallback(() => {
    setBaseTokenAddress(quoteTokenAddress);
    setQuoteTokenAddress(baseTokenAddress);
  }, [baseTokenAddress, quoteTokenAddress]);

  const onSelectTokenFactory = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      oppositeValue: string
    ) => (address: string): void => {
      if (address === oppositeValue) {
        swapTokens();
      } else {
        setter(address);
      }
    },
    [swapTokens]
  );

  const viewerProps: Props = {
    // inputs
    baseTokenAddress,
    quoteTokenAddress,
    lowestPrice,
    startPrice,
    highestPrice,
    baseTokenAmount,
    quoteTokenAmount,
    totalBrackets,
    // display
    baseTokenBrackets,
    quoteTokenBrackets,
    // callbacks
    swapTokens,
    onBaseTokenSelect: onSelectTokenFactory(
      setBaseTokenAddress,
      quoteTokenAddress
    ),
    onQuoteTokenSelect: onSelectTokenFactory(
      setQuoteTokenAddress,
      baseTokenAddress
    ),
    onLowestPriceChange: onChangeHandlerFactory(setLowestPrice),
    onStartPriceChange: onChangeHandlerFactory(setStartPrice),
    onHighestPriceChange: onChangeHandlerFactory(setHighestPrice),
    onBaseTokenAmountChange: onChangeHandlerFactory(setBaseTokenAmount),
    onQuoteTokenAmountChange: onChangeHandlerFactory(setQuoteTokenAmount),
    onTotalBracketsChange: onTotalBracketsChange,
    onSubmit: deployStrategy && onSubmit,
    isSubmitting,
    messages: error && [
      {
        type: "error",
        label: error.label,
        children: error.body,
      },
    ],
  };

  return <DeployPageViewer {...viewerProps} />;
}
