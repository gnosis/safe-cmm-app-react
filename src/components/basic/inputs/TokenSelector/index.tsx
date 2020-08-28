import React, { useMemo } from "react";

import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

import { TokenDetails } from "types";

import { useTokenList } from "hooks/useTokenList";
import { useTokenBalance } from "hooks/useTokenBalance";

import { TokenSelectorViewer } from "./viewer";

export interface Props {
  selectedTokenAddress?: string;
  label: string;
  tooltip: string;
  onSelect: (tokenAddress: string) => void;
}

/**
 * Token Selector (state) component
 *
 * Deals with hooks and state.
 * To be used externally in other components
 */
export const TokenSelector = (props: Props): JSX.Element => {
  const { selectedTokenAddress, ...rest } = props;

  const tokenList = useTokenList();
  const { balance: tokenBalance, isLoading } = useTokenBalance(
    selectedTokenAddress
  );

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

  return (
    <TokenSelectorViewer
      {...rest}
      items={items}
      tokenBalance={tokenBalance}
      tokenDetails={tokenDetails}
      isBalanceLoading={isLoading}
    />
  );
};
