import React from "react";

import { Text, Loader } from "@gnosis.pm/safe-react-components";
import {
  ThemeTextSize,
  ThemeColors,
} from "@gnosis.pm/safe-react-components/dist/theme";

import { useTokenDetails } from "hooks/useTokenDetails";

export interface Props {
  tokenAddress: string;
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
export const TokenDisplay = (props: Props): JSX.Element => {
  const { tokenAddress, size, color } = props;

  const tokenDetails = useTokenDetails(tokenAddress);

  return tokenDetails ? (
    <Text size={size} color={color} strong>
      {tokenDetails.symbol}
    </Text>
  ) : (
    <Loader size={size === "xl" ? "lg" : size} />
  );
};
