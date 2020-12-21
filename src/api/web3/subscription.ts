import Web3 from "web3";
import { BlockHeader } from "web3-eth";

import getLogger from "utils/logger";

const logger = getLogger("subscriptions");

export function subscribeToNewBlockHeaders({
  callback,
  web3,
}: {
  callback: (data: BlockHeader) => void;
  web3: Web3;
}): () => void {
  const onError = (error: Error): void => error && logger.error(error);

  const subscription = web3.eth
    .subscribe("newBlockHeaders", onError)
    .on("error", onError)
    .on("data", callback)
    .on("connected", (id) =>
      logger.log(`Subscription id for newBlockHeaders:`, id)
    );

  return () => subscription.unsubscribe();
}
