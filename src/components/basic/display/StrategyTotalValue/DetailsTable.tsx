import React, { memo } from "react";
import Decimal from "decimal.js";
import styled from "styled-components";

import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";

import { PercentageIndicator } from "./PercentageIndicator";

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

export type Props = { holdValue: Decimal; roi?: Decimal; apy?: Decimal };

export const DetailsTable = memo(function DetailsTable(
  props: Props
): JSX.Element {
  const { holdValue, roi, apy } = props;

  return (
    <Wrapper>
      <Text className="title" color="textGrey" size="xs" as="span">
        HODL VALUE
      </Text>
      <Text className="value" size="lg" as="span" strong>
        ${formatSmart(holdValue)}
      </Text>

      <Text className="title" color="textGrey" size="xs" as="span">
        ROI
      </Text>
      <PercentageIndicator className="value" value={roi} size="lg" />

      <Text className="title" color="textGrey" size="xs" as="span">
        APY
      </Text>
      <PercentageIndicator className="value" value={apy} size="lg" />
    </Wrapper>
  );
});
