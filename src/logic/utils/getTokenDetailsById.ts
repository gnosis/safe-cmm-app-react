import { TokenDetails } from "types";

const globalTokenIdToDetailsCache = {};

export const getTokenDetailsById = async (
  erc20Getter: (tokenAddress: string) => Promise<TokenDetails>,
  tokenId: number,
  batchExchangeContract: any
): Promise<TokenDetails> => {
  if (globalTokenIdToDetailsCache[tokenId]) {
    return globalTokenIdToDetailsCache[tokenId];
  }

  const tokenAddress = await batchExchangeContract.methods
    .tokenIdToAddressMap(tokenId)
    .call();

  const details = await erc20Getter(tokenAddress);

  globalTokenIdToDetailsCache[tokenId] = details;

  return globalTokenIdToDetailsCache[tokenId];
};
