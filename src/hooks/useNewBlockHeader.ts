import { useContext, useEffect, useState } from "react";
import { BlockHeader } from "web3-eth";

import { subscribeToNewBlockHeaders } from "api/web3/wallet";

import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

export function useNewBlockHeader(): BlockHeader | null {
  const [blockHeader, setBlockHeader] = useState<BlockHeader | null>(null);

  const { web3Instance: web3 } = useContext(ContractInteractionContext);

  useEffect(() => {
    const unsubscribe = subscribeToNewBlockHeaders({
      web3,
      callback: setBlockHeader,
    });

    return () => unsubscribe();
  }, [web3]);

  return blockHeader;
}
