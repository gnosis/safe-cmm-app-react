import React, { useMemo, useEffect } from "react";

import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

import { TokenDetails } from "types";

import { useTokenList } from "hooks/useTokenList";
import { useTokenBalance } from "hooks/useTokenBalance";

import { TokenSelectorViewer } from "./viewer";
import { tokenDetailsToSelectItem } from "utils/misc";

export interface Props {
  selectedTokenAddress?: string;
  label: string;
  tooltip: string;
  onSelect: (tokenAddress: string) => void;
  setError: (message?: string) => void;
}

/**
 * Token Selector (state) component
 *
 * Deals with hooks and state.
 * To be used externally in other components
 */
export const TokenSelector = (props: Props): JSX.Element => {
  const { selectedTokenAddress, setError, ...rest } = props;

  const tokenList = useTokenList();
  const { balance: tokenBalance, isLoading, error } = useTokenBalance(
    selectedTokenAddress
  );

  // TODO: propagate error to parent component, since the design does not expect errors at the component level
  // probably better when adding validation
  useEffect((): void => setError(error), [error]);

  const tokenDetails = useMemo(
    (): TokenDetails | undefined =>
      selectedTokenAddress &&
      tokenList.find((token) => token.address === selectedTokenAddress),
    [tokenList, selectedTokenAddress]
  );

  const items = useMemo(
    (): SelectItem[] => tokenList.map(tokenDetailsToSelectItem),
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
