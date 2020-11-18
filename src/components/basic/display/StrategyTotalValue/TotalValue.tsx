import React, { memo } from "react";
import Decimal from "decimal.js";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { formatSmart } from "utils/format";

import { TextWithTooltip } from "components/basic/display/TextWithTooltip";
import { Text } from "components/basic/display/Text";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-bottom: 15px;
`;

export type Props = { value?: Decimal; isLoading?: boolean };

const TOOLTIP =
  "The total value of all your brackets combined in your strategy. This can be compared with the HODL VALUE to compare performance of your strategy vs. if you held the assets without a strategy.";

export const TotalValue = memo(function TotalValue(props: Props): JSX.Element {
  const { value, isLoading } = props;

  return (
    <Wrapper>
      <TextWithTooltip color="textGrey" tooltip={TOOLTIP} size="xs">
        TOTAL VALUE
      </TextWithTooltip>
      {isLoading ? (
        <Loader size="sm" />
      ) : (
        <Text size="xxl" strong>
          {!value || value.isNaN() ? "N/A" : `$${formatSmart(value)}`}
        </Text>
      )}
    </Wrapper>
  );
});
