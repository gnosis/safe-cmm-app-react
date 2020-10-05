import { useState, useContext, useEffect } from "react";
import { TokenBalance } from "types";

import { Web3Context } from "components/Web3Provider";

interface Return {
  tokenDetails: TokenBalance | null;
  isLoading: boolean;
  error: string;
}

export function useTokenDetails(token?: string): Return {
  const [tokenDetails, setTokenDetails] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    async function fetchTokenDetails(): Promise<void> {
      if (token) {
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
  }, [token, getErc20Details]);

  return { tokenDetails, isLoading, error };
}
