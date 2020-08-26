import React, { useMemo } from "react";
import styled from "styled-components";
import BN from "bn.js";

import { formatSmart } from "@gnosis.pm/dex-js";
import { Select, Loader } from "@gnosis.pm/safe-react-components";
import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

import { TokenDetails } from "types";

import { useTokenList } from "hooks/useTokenList";
import { useTokenBalance } from "hooks/useTokenBalance";

import { LabelWithTooltip } from "components/basic/labels/LabelWithTooltip";
import { SubtextAmount } from "components/basic/misc/SubtextAmount";

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

  return (
    <TokenSelectorView
      {...props}
      items={items}
      tokenBalance={tokenBalance}
      tokenDetails={tokenDetails}
    />
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface TokenSelectorViewProps extends Props {
  items: SelectItem[];
  tokenBalance: BN | null;
  tokenDetails: TokenDetails | undefined;
}

/**
 * Token Selector (view) component
 *
 * Has no state nor deals with hooks, to ease testing/storybook view
 */
export const TokenSelectorView = (
  props: TokenSelectorViewProps
): JSX.Element => {
  const { label, tooltip, items, tokenBalance, tokenDetails, onSelect } = props;

  const amount = useMemo((): string | React.ReactElement => {
    if (!tokenDetails || !tokenBalance) {
      return <Loader size="xs" />;
    }

    const formattedAmount = formatSmart({
      amount: tokenBalance,
      precision: tokenDetails.decimals,
    });

    return `${formattedAmount} ${tokenDetails.symbol}`;
  }, [tokenBalance, tokenDetails]);

  return (
    <Wrapper>
      <LabelWithTooltip
        text={label}
        tooltip={tooltip}
        size="lg"
        color="shadow"
      />
      {/* TODO: add fallback image */}
      <Select
        items={items}
        activeItemId={tokenDetails?.address}
        onItemClick={onSelect}
      />
      <SubtextAmount subtext="Safe balance:" amount={amount} inline />
    </Wrapper>
  );
};
