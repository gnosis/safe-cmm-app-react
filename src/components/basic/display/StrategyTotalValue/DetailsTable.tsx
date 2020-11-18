import React, { memo } from "react";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";
import { TextWithTooltip } from "components/basic/display/TextWithTooltip";

import { PercentageIndicator } from "./PercentageIndicator";
import { LoadingValue } from "./viewer";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-areas: "title value";
  grid-column-gap: 12px;

  align-items: center;

  .title {
    justify-self: right;
  }

  .value {
    justify-self: left;
  }
`;

const HOLD_VALUE_TOOLTIP =
  "Approximate value the initial funding is worth today in USD";
const ROI_VALUE_TOOLTIP =
  "Percentual difference between the strategy current approximate value in USD and the Hold value in USD";
const APR_VALUE_TOOLTIP =
  "Annualized percentual difference between the approximate initial funding in USD (at funding date) and the approximate current strategy value in USD";

export type Props = {
  holdValue?: LoadingValue;
  roi?: LoadingValue;
  apr?: LoadingValue;
};

export const DetailsTable = memo(function DetailsTable(
  props: Props
): JSX.Element {
  const { holdValue, roi, apr } = props;

  return (
    <Wrapper>
      <TextWithTooltip
        className="title"
        color="textGrey"
        size="xs"
        tooltip={HOLD_VALUE_TOOLTIP}
      >
        HOLD VALUE
      </TextWithTooltip>
      {holdValue?.isLoading ? (
        <Loader size="sm" />
      ) : (
        <Text className="value" size="lg" as="span" strong>
          {!holdValue?.value || holdValue.value.isNaN()
            ? "N/A"
            : `$${formatSmart(holdValue.value)}`}
        </Text>
      )}

      <TextWithTooltip
        className="title"
        color="textGrey"
        size="xs"
        tooltip={ROI_VALUE_TOOLTIP}
      >
        ROI
      </TextWithTooltip>
      <PercentageIndicator className="value" {...roi} size="lg" />

      <TextWithTooltip
        className="title"
        color="textGrey"
        size="xs"
        tooltip={APR_VALUE_TOOLTIP}
      >
        APR
      </TextWithTooltip>
      <PercentageIndicator className="value" {...apr} size="lg" />
    </Wrapper>
  );
});
