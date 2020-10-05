import React from "react";
import styled from "styled-components";

import { theme } from "theme";

import {
  NumberInput,
  Props as NumberInputProps,
} from "components/basic/inputs/NumberInput";

const Wrapper = styled(NumberInput)`
  .MuiInputBase-input {
    height: 30px;
  }

  .MuiFilledInput-input {
    padding: 12.5px 11px;
    // centers the text, but decreases the size
    font-variant: small-caps;
    // increase the size back up
    font-size: 35px;
    line-height: 30px;
    heigh: 30px;
    text-align: center;
    color: ${theme.colors.primary};
  }
`;

export type Props = Omit<NumberInputProps, "type">;

export const BracketsInput = (props: Props): JSX.Element => {
  const { value } = props;

  return (
    <Wrapper
      {...props}
      // TODO: Seems like step and min are not respected.
      // Oh well, let's deal with that when adding validation
      input={{ type: "number", step: 1, min: 1, value }}
    />
  );
};
