import React, { useMemo } from "react";
import BN from "bn.js";
import styled from "styled-components";

import { Loader, Select } from "@gnosis.pm/safe-react-components";
import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";
import { formatSmart } from "@gnosis.pm/dex-js";

import { TokenDetails } from "types";

import { LabelWithTooltip } from "components/basic/labels/LabelWithTooltip";
import { SubtextAmount } from "components/basic/misc/SubtextAmount";

const COMPONENT_WIDTH = "305px";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: ${COMPONENT_WIDTH};
`;

const SelectWrapper = styled(Select)`
  width: ${COMPONENT_WIDTH};
`;

export interface TokenSelectorViewerProps {
  label: string;
  tooltip: string;
  onSelect: (tokenAddress: string) => void;
  items: SelectItem[];
  tokenBalance: BN | null;
  tokenDetails?: TokenDetails;
}

export const TokenSelectorViewer = (
  props: TokenSelectorViewerProps
): JSX.Element => {
  const { label, tooltip, items, tokenBalance, tokenDetails, onSelect } = props;

  const amount = useMemo((): string | React.ReactElement => {
    // TODO: expose loading from tokenBalance
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
      <SelectWrapper
        items={items}
        activeItemId={tokenDetails?.address || ""}
        onItemClick={onSelect}
      />
      <SubtextAmount subtext="Safe balance:" amount={amount} inline />
    </Wrapper>
  );
};
