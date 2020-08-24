import React from "react";
import styled from "styled-components";

import { theme } from "@gnosis.pm/safe-react-components";

import {
  NumberInput,
  Props as NumberInputProps,
} from "components/inputs/NumberInput";

// TODO: can't get the text to center vertically
// As far I could find out, the font is the culprit.
// There seems to be a bottom padding pushing the text up
const Wrapper = styled(NumberInput)`
  .MuiInputBase-input {
    height: 30px;
  }

  .MuiFilledInput-input {
    padding: 12.5px 12px;
    font-size: 30px;
    line-height: 30px;
    heigh: 30px;
    text-align: center;
    color: ${theme.colors.primary};
  }
`;

export interface Props extends Omit<NumberInputProps, "type"> {}

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
