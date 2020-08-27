import React, { useContext, useMemo } from "react";
import { TokenSelectorContext } from "./context";
import { Loader, Select } from "@gnosis.pm/safe-react-components";
import { formatSmart } from "@gnosis.pm/dex-js";
import styled from "styled-components";
import { LabelWithTooltip } from "components/basic/labels/LabelWithTooltip";
import { SubtextAmount } from "components/basic/misc/SubtextAmount";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface TokenSelectorContainerProps {
  selectedTokenAddress?: string;
  label: string;
  tooltip: string;
  onSelect: (tokenAddress: string) => void;
}

export const TokenSelectorContainer = (
  props: TokenSelectorContainerProps
): JSX.Element => {
  const { label, tooltip, onSelect } = props;
  const { items, tokenBalance, tokenDetails } = useContext(
    TokenSelectorContext
  );

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
