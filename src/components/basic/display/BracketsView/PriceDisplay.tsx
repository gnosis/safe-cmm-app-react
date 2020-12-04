import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";

import { TokenDisplay } from "../TokenDisplay";

export type Props = {
  price?: string;
  quoteToken?: string;
  color?: "primary" | "text";
  size?: "sm" | "xs";
  className?: string;
  adornment?: "left" | "right";
  isOutOfRange?: boolean;
};

const Wrapper = styled.div`
  display: flex;

  & > *:not(:last-child) {
    margin-right: 0.25em;
  }
`;

export const PriceDisplay = memo(function PriceDisplay(
  props: Props
): JSX.Element {
  const {
    price,
    quoteToken,
    className,
    color = "text",
    size = "sm",
    adornment,
    isOutOfRange,
  } = props;

  return (
    <Wrapper className={className}>
      {adornment === "left" && (
        <Text size={size} as="span" color={color}>
          &lt;
        </Text>
      )}
      <Text size={size} as="span" color={color}>
        {price}
      </Text>
      {quoteToken && (
        <TokenDisplay token={quoteToken} size={size} color={color} />
      )}
      {isOutOfRange && (
        <Text size={size} color="rinkeby">
          (out of range)
        </Text>
      )}
      {adornment === "right" && (
        <Text size={size} as="span" color={color}>
          &gt;
        </Text>
      )}
    </Wrapper>
  );
});
