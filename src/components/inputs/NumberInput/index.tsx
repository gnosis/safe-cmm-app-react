import React, { useCallback, useContext, useEffect, useState } from "react";

import { Web3Context } from "components/Web3Provider";

import {
  Props as TextFieldWithCustomLabelProps,
  TextFieldWithCustomLabel,
} from "components/inputs/TextFieldWithCustomLabel";
import { TokenDetails } from "types";
import { TokenDisplay } from "components/misc/TokenDisplay";

export interface Props
  extends Omit<
    TextFieldWithCustomLabelProps,
    "startAdornment" | "endAdornment" | "input"
  > {
  tokenAddress?: string;
}

/**
 * Input with label on top that only allow numbers with optional token display
 */
export const NumberInput = (props: Props): JSX.Element => {
  const { onChange, tokenAddress, ...rest } = props;

  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    if (tokenAddress) {
      getErc20Details(tokenAddress).then(setTokenDetails);
    }
  }, [tokenAddress]);

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
