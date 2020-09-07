import { TokenDetails } from "types";

export function build1InchPriceUrl(
  baseToken?: TokenDetails,
  quoteToken?: TokenDetails
): string {
  if (!baseToken || !quoteToken) {
    return "";
  }
  return `https://1inch.exchange/#/${baseToken.symbol || baseToken.address}/${
    quoteToken.symbol || quoteToken.address
  }`;
}
