import { createContext } from "react";
import BN from "bn.js";

import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

import { TokenDetails } from "types";

export interface TokenSelectorContextProps {
  items: SelectItem[];
  tokenDetails?: TokenDetails;
  tokenBalance: BN | null;
}

export const TokenSelectorContext = createContext<TokenSelectorContextProps>({
  items: [],
  tokenBalance: null,
});
