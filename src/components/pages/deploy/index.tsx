import React, { useCallback, useState } from "react";

import { DeployPageViewer, Props } from "./viewer";

// TODO: fix type
const onChangeHandlerFactory = (
  setter: React.Dispatch<React.SetStateAction<string>>
) => (event: React.ChangeEvent<HTMLInputElement>): void => {
  console.log(`going to set something`, event.target.value);
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
    onBaseTokenSelect: setBaseTokenAddress,
    onQuoteTokenSelect: setQuoteTokenAddress,
    onLowestPriceChange: onChangeHandlerFactory(setLowestPrice),
    onStartPriceChange: onChangeHandlerFactory(setStartPrice),
    onHighestPriceChange: onChangeHandlerFactory(setHighestPrice),
    onBaseTokenAmountChange: onChangeHandlerFactory(setBaseTokenAmount),
    onQuoteTokenAmountChange: onChangeHandlerFactory(setQuoteTokenAmount),
    onTotalBracketsChange: onTotalBracketsChange,
  };

  return <DeployPageViewer {...viewerProps} />;
}
