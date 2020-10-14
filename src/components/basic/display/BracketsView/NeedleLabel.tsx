import React, { memo, useContext } from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

import { BracketsViewContext } from "./viewer";

const Wrapper = styled.span`
  width: max-content;
  position: absolute;
  top: -1.4em;
`;

type Props = {
  adornment?: "left" | "right";
  className?: string;
  onNeedle?: boolean;
};

export const NeedleLabel = memo(function NeedleLabel(
  props: Props
): JSX.Element {
  const { adornment, className, onNeedle } = props;
  const { type } = useContext(BracketsViewContext);

  const label = type === "deploy" ? "START PRICE" : "MARKET PRICE";

  const text = (
    <Text as="span" size="sm" color="primary" strong className={className}>
      {adornment === "left" && "<"} {label} {adornment === "right" && ">"}
    </Text>
  );

  // Additional wrapper only when text is displayed on Needle for absolute positioning
  return onNeedle ? <Wrapper className={className}>{text}</Wrapper> : text;
});
