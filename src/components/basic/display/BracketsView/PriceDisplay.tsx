import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

import { TokenDisplay } from "../TokenDisplay";

export type Props = {
  price?: string;
  token?: string;
  color?: "primary" | "text";
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
    token,
    className,
    color = "text",
    adornment,
    isOutOfRange,
  } = props;

  return (
    <Wrapper className={className}>
      {adornment === "left" && (
        <Text size="sm" as="span" color={color}>
          &lt;
        </Text>
      )}
      <Text size="sm" as="span" color={color}>
        {price}
      </Text>
      <TokenDisplay token={token} size="sm" color={color} />
      {isOutOfRange && (
        <Text size="sm" color="rinkeby">
          (out of range)
        </Text>
      )}
      {adornment === "right" && (
        <Text size="sm" as="span" color={color}>
          &gt;
        </Text>
      )}
    </Wrapper>
  );
});
