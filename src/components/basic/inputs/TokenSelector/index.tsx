import React, { useMemo, memo } from "react";
import { useRecoilValue } from "recoil";

import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

import { useTokenBalance } from "hooks/useTokenBalance";
import { useTokenDetails } from "hooks/useTokenDetails";

import { tokenDetailsToSelectItem } from "utils/misc";
import { tokenListState } from "state/selectors";

import { TokenSelectorViewer } from "./viewer";

export interface Props {
  selectedTokenAddress?: string;
  label: string;
  tooltip: string;
  onSelect: (tokenAddress: string) => void;
  setError?: (message?: string) => void;
}

/**
 * Token Selector (state) component
 *
 * Deals with hooks and state.
 * To be used externally in other components
 */
export const TokenSelector = memo(function TokenSelector(
  props: Props
): JSX.Element {
  const { selectedTokenAddress, setError, ...rest } = props;

  const tokenList = useRecoilValue(tokenListState);
  const tokenBalance = useTokenBalance(selectedTokenAddress);
  const tokenDetails = useTokenDetails(selectedTokenAddress);

  // TODO: propagate error to parent component, since the design does not expect errors at the component level
  // probably better when adding validation

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
    />
  );
});
