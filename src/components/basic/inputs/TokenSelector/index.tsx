import React, { useMemo } from "react";

import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

import { TokenDetails } from "types";

import { useTokenList } from "hooks/useTokenList";
import { useTokenBalance } from "hooks/useTokenBalance";

import {
  TokenSelectorContainerProps,
  TokenSelectorContainer,
} from "./container";
import { TokenSelectorContext } from "./context";

export interface Props extends TokenSelectorContainerProps {}

/**
 * Token Selector (state) component
 *
 * Deals with hooks and state.
 * To be used externally in other components
 */
export const TokenSelector = (props: Props): JSX.Element => {
  const { selectedTokenAddress } = props;

  const tokenList = useTokenList();
  const tokenBalance = useTokenBalance(selectedTokenAddress);

  const tokenDetails = useMemo(
    (): TokenDetails | undefined =>
      selectedTokenAddress &&
      tokenList.find((token) => token.address === selectedTokenAddress),
    [tokenList, selectedTokenAddress]
  );

  // TODO: add token image
  const items = useMemo(
    (): SelectItem[] =>
      tokenList.map(
        (token): SelectItem => ({
          id: token.address,
          label: token.symbol,
          subLabel: token.name,
        })
      ),
    [tokenList]
  );

  const context = useMemo(() => ({ items, tokenBalance, tokenDetails }), [
    items,
    tokenBalance,
    tokenDetails,
  ]);

  // TODO: I think this is useless. Has the same effect as passing in the context
  // as props
  return (
    <TokenSelectorContext.Provider value={context}>
      <TokenSelectorContainer {...props} />
    </TokenSelectorContext.Provider>
  );
};
