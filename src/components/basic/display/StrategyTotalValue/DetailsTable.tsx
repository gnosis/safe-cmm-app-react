import React, { memo } from "react";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";

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
      <Text className="title" color="textGrey" size="xs" as="span">
        HODL VALUE
      </Text>
      {holdValue?.isLoading ? (
        <Loader size="sm" />
      ) : (
        <Text className="value" size="lg" as="span" strong>
          {!holdValue?.value || holdValue.value.isNaN()
            ? "N/A"
            : `$${formatSmart(holdValue.value)}`}
        </Text>
      )}

      <Text className="title" color="textGrey" size="xs" as="span">
        ROI
      </Text>
      <PercentageIndicator className="value" {...roi} size="lg" />

      <Text className="title" color="textGrey" size="xs" as="span">
        APR
      </Text>
      <PercentageIndicator className="value" {...apr} size="lg" />
    </Wrapper>
  );
});
