import { TokenDetails } from "types";
import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

/**
 * Uses images from https://github.com/trustwallet/tokens
 */
export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined;
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
}

/**
 * Transforms from TokenDetails instance into a SelectItem instance
 * to be used with <Select> component
 *
 * @param tokenDetails Token details instance
 */
export function tokenDetailsToSelectItem(
  tokenDetails: TokenDetails
): SelectItem {
  return {
    id: tokenDetails.address,
    label: tokenDetails.symbol,
    iconUrl: tokenDetails.imageUrl,
  };
}
