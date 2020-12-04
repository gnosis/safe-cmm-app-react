import React, { memo } from "react";
import Decimal from "decimal.js";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { ThemeTextSize } from "theme";

import { ONE_HUNDRED_DECIMAL, ZERO_DECIMAL } from "utils/constants";

import { Text } from "components/basic/display/Text";
import { Arrow } from "components/basic/display/Arrow";

const Wrapper = styled.div<{ isPositive: boolean }>`
  display: inline-flex;
  align-items: center;

  & > :last-child {
    margin-left: 2px;
  }
`;

export type Props = {
  value?: Decimal;
  isLoading?: boolean;
  loaderSize?: React.ComponentProps<typeof Loader>["size"];
  className?: string;
  size?: ThemeTextSize;
};

function formatValue(value: Decimal): string {
  return `${value.mul(ONE_HUNDRED_DECIMAL).toFixed(2)}%`;
}

export const PercentageIndicator = memo(function PercentageIndicator(
  props: Props
): JSX.Element {
  const { value, isLoading, size, loaderSize = "sm", className } = props;

  if (isLoading) {
    return <Loader size={loaderSize} />;
  }
  if (!value || value.isNaN()) {
    return <Text as="span">N/A</Text>;
  }

  const isPositive = value.gte(ZERO_DECIMAL);
  const displayValue = (isPositive ? "+" : "") + formatValue(value);

  return (
    <Wrapper className={className} isPositive={isPositive}>
      <Text
        color={isPositive ? "roiApyPositive" : "roiApyNegative"}
        size={size}
        strong
        as="span"
      >
        {displayValue}
      </Text>
      <Arrow
        size="xs"
        className="icon"
        direction={isPositive ? "up" : "down"}
        color={isPositive ? "roiApyPositive" : "roiApyNegative"}
      />
    </Wrapper>
  );
});
