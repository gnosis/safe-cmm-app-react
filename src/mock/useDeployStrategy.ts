import { useDeployStrategy as hook } from "hooks/useDeployStrategy";
import { createMockHook } from "./mockHookContext";

export const useDeployStrategy = createMockHook<typeof hook>(
  "useDeployStrategy",
  async () => undefined
);
