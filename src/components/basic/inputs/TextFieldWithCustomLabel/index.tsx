import React from "react";
import styled from "styled-components";

import { InputLabel } from "@material-ui/core";
import { TextField, theme } from "@gnosis.pm/safe-react-components";
import { pxOrCustomCssUnits } from "utils/cssUtils";

// To match parent's width https://github.com/gnosis/safe-react-components/blob/development/src/inputs/TextField/index.tsx#L24
const WIDTH = 400;

// Local alias for proper typing
type Theme = typeof theme;

interface WrapperProps {
  width?: string | number;
  inputWidth?: string | number;
  center?: boolean;
  error?: boolean;
  warn?: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  width: ${({ width }: WrapperProps): string =>
    pxOrCustomCssUnits(width || WIDTH)};

  ${({ center }: WrapperProps): string =>
    !center
      ? ""
      : `
  display: flex;
  flex-direction: column;
  align-items: center;
  `}

  // Adjust input padding which is normally pushed down to accommodate default label
  .MuiFilledInput-input {
    padding: 19px 12px 18px;
    font-family: "Averta";
  }

  .MuiInputAdornment-filled.MuiInputAdornment-positionStart:not(.MuiInputAdornment-hiddenLabel) {
    margin-top: 0;
  }

  .MuiFormControl-root {
    ${({ width, inputWidth }: WrapperProps): string =>
      inputWidth || width
        ? `width: ${pxOrCustomCssUnits(inputWidth || width)};`
        : ""}
  }

  // We don't want to display the field label neither the error messages.
  // https://github.com/gnosis/safe-react-components/blob/development/src/inputs/TextField/index.tsx#L57
  .MuiFormLabel-filled {
    display: none;
  }

  // Set's WARN/ERROR based on boolean
  // Parent doesn't provide WARN, and requires error message for ERROR
  ${({ theme, error, warn }: { theme: Theme } & WrapperProps): string => {
    if (!error && !warn) {
      return "";
    }
    return `
    .MuiFilledInput-root.MuiFilledInput-underline::after {
      border-bottom-color: ${error ? theme.colors.error : theme.colors.warning};
      transform: scaleX(1);
    }`;
  }}

  .MuiInputAdornment-positionEnd {
    margin-left: 0;
  }
`;

export interface Props
  extends Omit<React.ComponentProps<typeof TextField>, "label">,
    WrapperProps {
  customLabel: React.ReactElement;
}

export const TextFieldWithCustomLabel = (props: Props): JSX.Element => {
  const { customLabel, inputWidth, center, ...rest } = props;

  return (
    <Wrapper {...rest} inputWidth={inputWidth} center={center}>
      <InputLabel htmlFor={rest.id}>{customLabel}</InputLabel>
      <TextField {...rest} label={null} />
    </Wrapper>
  );
};
