import React, { useMemo, memo } from "react";
import BN from "bn.js";
import styled from "styled-components";

import { Select } from "@gnosis.pm/safe-react-components";
import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";
import { formatSmart } from "@gnosis.pm/dex-js";

import { TokenDetails } from "types";

import fallbackTokenImg from "img/fallbackTokenImg.svg";

import { TextWithTooltip } from "components/basic/display/TextWithTooltip";
import { SubtextAmount } from "components/basic/display/SubtextAmount";

import { Props } from ".";

const COMPONENT_WIDTH = "200px";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > :first-child {
    padding-bottom: 0.4em;
  }

  width: ${COMPONENT_WIDTH};
`;

const SelectWrapper = styled(Select)`
  width: ${COMPONENT_WIDTH};

  .MuiSelect-root.MuiSelect-select.MuiSelect-selectMenu.MuiInputBase-input.MuiInput-input
    > div
    > p {
    font-size: 13px;
  }
`;

export interface TokenSelectorViewerProps
  extends Omit<Props, "selectedTokenAddress" | "setError"> {
  items: SelectItem[];
  tokenBalance: BN | null;
  tokenDetails?: TokenDetails;
}

export const TokenSelectorViewer = memo(function TokenSelectorViewer(
  props: TokenSelectorViewerProps
): JSX.Element {
  const { label, tooltip, items, tokenBalance, tokenDetails, onSelect } = props;

  const amount = useMemo((): string | React.ReactElement => {
    if (!tokenDetails || !tokenBalance) {
      return "-";
    }

    const formattedAmount = formatSmart({
      amount: tokenBalance,
      precision: tokenDetails.decimals,
    });

    return `${formattedAmount} ${tokenDetails.symbol}`;
  }, [tokenBalance, tokenDetails]);

  return (
    <Wrapper>
      <TextWithTooltip tooltip={tooltip} size="lg" color="shadow">
        {label}
      </TextWithTooltip>
      <SelectWrapper
        items={items}
        activeItemId={tokenDetails?.address || ""}
        onItemClick={onSelect}
        fallbackImage={fallbackTokenImg}
      />
      <SubtextAmount subtext="Safe balance:" amount={amount} inline />
    </Wrapper>
  );
});
