import { useState, useContext, useEffect } from "react";
import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

interface Return {
  tokenDetails: TokenDetails | null;
  isLoading: boolean;
  error: string;
}

export function useTokenDetails(token?: string | TokenDetails): Return {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(
    typeof token === "string" || typeof token === undefined ? null : token
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    async function fetchTokenDetails(): Promise<void> {
      if (typeof token === "string" && token) {
        setIsLoading(true);
        setError("");
        try {
          setTokenDetails(await getErc20Details(token));
        } catch (e) {
          const msg = `Failed to fetch token details for address ${token}`;
          console.error(msg, e);
          setError(msg);
        }
        setIsLoading(false);
      }
    }
    fetchTokenDetails();
  }, [token]);

  return { tokenDetails, isLoading, error };
}
