import { useState, useContext, useEffect } from "react";
import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

export function useTokenDetails(
  token?: string | TokenDetails
): TokenDetails | null {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(
    typeof token === "string" || typeof token === undefined ? null : token
  );

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    if (typeof token === "string") {
      getErc20Details(token).then(setTokenDetails);
    }
  }, [token]);

  return tokenDetails;
}
