import React from "react";
import styled from "styled-components";

import { InputLabel } from "@material-ui/core";
import { TextField } from "@gnosis.pm/safe-react-components";
import { pxOrCustomCssUnits } from "utils/cssUtils";

// To match parent's width https://github.com/gnosis/safe-react-components/blob/development/src/inputs/TextField/index.tsx#L24
const WIDTH = 400;

const Wrapper = styled.div<{ width?: string | number }>`
  width: ${({ width }) => pxOrCustomCssUnits(width || WIDTH)};

  // Adjust input padding which is normally pushed down to accommodate default label 
  .MuiFilledInput-input {
    padding 19px 12px 18px;
  }

  .MuiInputAdornment-filled.MuiInputAdornment-positionStart:not(.MuiInputAdornment-hiddenLabel) {
    margin-top:0;
  }

  .MuiFormControl-root {
    ${({ width }) => (width ? `width: ${pxOrCustomCssUnits(width)}` : "")}
  }
`;

export interface Props
  extends Omit<React.ComponentProps<typeof TextField>, "label"> {
  customLabel: React.ReactElement;
}

export const TextFieldWithCustomLabel = (props: Props): JSX.Element => {
  const { customLabel, width } = props;

  return (
    <Wrapper width={width}>
      <InputLabel htmlFor={props.id}>{customLabel}</InputLabel>
      <TextField {...props} label={null} />
    </Wrapper>
  );
};
