import React, { memo } from "react";

import { Text, Loader } from "@gnosis.pm/safe-react-components";
import {
  ThemeTextSize,
  ThemeColors,
} from "@gnosis.pm/safe-react-components/dist/theme";

import { useTokenDetails } from "hooks/useTokenDetails";

export interface Props {
  token: string;
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
export const TokenDisplay = memo(function TokenDisplay(
  props: Props
): JSX.Element {
  const { token, size, color } = props;

  // TODO: handle error
  const { tokenDetails, isLoading } = useTokenDetails(token);

  return tokenDetails ? (
    <Text size={size} color={color} strong as="span">
      {tokenDetails.symbol}
    </Text>
  ) : isLoading ? (
    <Loader size={size === "xl" ? "lg" : size} />
  ) : (
    <Text size={size} color={color} strong as="span">
      -
    </Text>
  );
});
