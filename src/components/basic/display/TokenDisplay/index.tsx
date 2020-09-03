import React, { memo } from "react";

import { Text, Loader } from "@gnosis.pm/safe-react-components";
import {
  ThemeTextSize,
  ThemeColors,
} from "@gnosis.pm/safe-react-components/dist/theme";

import { TokenDetails } from "types";

import { useTokenDetails } from "hooks/useTokenDetails";

export interface Props {
  token: string | TokenDetails;
  size: ThemeTextSize;
  color?: ThemeColors;
}

/**
 * Base component to display a token (symbol, name, address)
 * according to what's available.
 *
 * ### TODO:
 * - display shortened address with link to Etherscan when symbol/name not available
 * - add support for displaying token images
 */
const _TokenDisplay = (props: Props): JSX.Element => {
  const { token, size, color } = props;

  const tokenDetails = useTokenDetails(token);

  return tokenDetails ? (
    <Text size={size} color={color} strong>
      {tokenDetails.symbol}
    </Text>
  ) : (
    <Loader size={size === "xl" ? "lg" : size} />
  );
};

export const TokenDisplay = memo(_TokenDisplay);
