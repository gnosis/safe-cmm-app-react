import { useState, useContext, useEffect } from "react";
import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

export function useTokenDetails(address?: string): TokenDetails | null {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    if (address) {
      getErc20Details(address).then(setTokenDetails);
    }
  }, [address]);

  return tokenDetails;
}
