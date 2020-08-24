import React, { useCallback } from "react";

import { useTokenDetails } from "hooks/useTokenDetails";

import {
  Props as TextFieldWithCustomLabelProps,
  TextFieldWithCustomLabel,
} from "components/inputs/TextFieldWithCustomLabel";
import { TokenDisplay } from "components/misc/TokenDisplay";

export interface Props
  extends Omit<
    TextFieldWithCustomLabelProps,
    "startAdornment" | "endAdornment"
  > {
  tokenAddress?: string;
}

/**
 * Input with label on top that only allow numbers with optional token display
 */
export const NumberInput = (props: Props): JSX.Element => {
  const { onChange, tokenAddress, ...rest } = props;

  const tokenDetails = useTokenDetails(tokenAddress);

  const endAdornment = tokenDetails && (
    <TokenDisplay size="md" tokenDetails={tokenDetails} />
  );

  const onlyAllowNumbers = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (!isNaN(+event.target.value)) {
        onChange(event);
      } else {
        event.preventDefault();
      }
    },
    []
  );

  return (
    <TextFieldWithCustomLabel
      {...rest}
      onChange={onlyAllowNumbers}
      endAdornment={endAdornment}
    />
  );
};
