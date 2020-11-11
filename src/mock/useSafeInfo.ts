import { useSafeInfo as hook } from "hooks/useSafeInfo";
import { createMockHook } from "./mockHookContext";

export const useSafeInfo = createMockHook<typeof hook>("useSafeInfo", {
  network: "MAINNET",
  ethBalance: "0",
  safeAddress: "0x0",
});
