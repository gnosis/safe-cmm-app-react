import Decimal from "decimal.js";

import { useGetPrice } from "hooks/useGetPrice";

export const mockUseGetPriceFactory = (
  isLoading?: boolean,
  error?: string
): typeof useGetPrice => (
  ...[params]: Parameters<typeof useGetPrice>
): ReturnType<typeof useGetPrice> => {
  return {
    price: !params.baseToken || !params.quoteToken ? null : new Decimal("100"),
    isLoading: !!isLoading,
    error: error || "",
  };
};
