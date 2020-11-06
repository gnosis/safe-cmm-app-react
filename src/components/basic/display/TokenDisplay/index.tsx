import React, { memo } from "react";

import { Loader } from "@gnosis.pm/safe-react-components";

import { useTokenDetails } from "hooks/useTokenDetails";

import { ThemeColors, ThemeLoaderSize } from "theme";

import { Text } from "components/basic/display/Text";

export interface Props {
  token: string;
  size?: ThemeLoaderSize;
  color?: ThemeColors;
  className?: string;
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
  const { token, size, color, className } = props;

  // TODO: handle error
  const { tokenDetails, isLoading } = useTokenDetails(token);

  return tokenDetails ? (
    <Text size={size} color={color} strong as="span" className={className}>
      {tokenDetails.symbol}
    </Text>
  ) : isLoading ? (
    <Loader size={size} className={className} />
  ) : (
    <Text size={size} color={color} strong as="span" className={className}>
      -
    </Text>
  );
});
