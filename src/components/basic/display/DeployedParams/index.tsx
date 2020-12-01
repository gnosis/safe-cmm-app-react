import React, { memo, useMemo } from "react";
import { Box } from "@material-ui/core";

import { Loader } from "@gnosis.pm/safe-react-components";

import { StrategyState } from "types";

import { useAmountInUsd } from "hooks/useAmountInUsd";

import { decimalFormat } from "utils/decimalFormat";
import { safeAddDecimals } from "utils/calculations";
import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";

export type Props = {
  strategy: StrategyState;
};

export const DeployedParams = memo(function DeployedParams(
  props: Props
): JSX.Element {
  const { strategy } = props;
  const { baseToken, quoteToken, baseFunding, quoteFunding } = strategy;

  const {
    amountInUsd: baseAmountInUsd,
    isLoading: isBaseAmountLoading,
  } = useAmountInUsd({
    tokenAddress: baseToken.address,
    amount: baseFunding?.toFixed(),
    source: "GnosisProtocol",
  });
  const {
    amountInUsd: quoteAmountInUsd,
    isLoading: isQuoteAmountLoading,
  } = useAmountInUsd({
    tokenAddress: quoteToken.address,
    amount: quoteFunding?.toFixed(),
    source: "GnosisProtocol",
  });

  const totalFunding = useMemo((): React.ReactNode => {
    if (isBaseAmountLoading || isQuoteAmountLoading) {
      return <Loader size="xs" />;
    }

    try {
      const amountString = formatSmart(
        safeAddDecimals(baseAmountInUsd, quoteAmountInUsd)
      );
      return amountString ? `~$${amountString}` : "N/A";
    } catch (e) {
      console.error(`Failed to format total funding`, e);
      return "N/A";
    }
  }, [
    baseAmountInUsd,
    isBaseAmountLoading,
    isQuoteAmountLoading,
    quoteAmountInUsd,
  ]);

  const totalFundingTuple = ["Total funding", totalFunding];

  const params = useMemo((): Array<any> => {
    return [
      [
        "Lowest Price",
        `${decimalFormat(
          strategy.priceRange.lower,
          strategy.priceRange.token
        )}`,
      ],
      [
        "Price Range",
        `${decimalFormat(
          strategy.priceRange.lower,
          strategy.priceRange.token
        )} - ${decimalFormat(
          strategy.priceRange.upper,
          strategy.priceRange.token
        )}`,
      ],
      [
        "Highest Price",
        `${decimalFormat(
          strategy.priceRange.upper,
          strategy.priceRange.token
        )}`,
      ],
      null, // separator
      [
        `Total ${strategy.baseToken.symbol} deposited`,
        `${formatSmart(strategy.baseFunding)}`,
      ],
      [
        `Total ${strategy.quoteToken.symbol} deposited`,
        `${formatSmart(strategy.quoteFunding)}`,
      ],
    ];
  }, [strategy]);

  return (
    <Box>
      {params.concat([totalFundingTuple]).map(
        (labelValuePairOrNull: string[] | null): JSX.Element => {
          if (labelValuePairOrNull === null) return <br />;
          const [label, value] = labelValuePairOrNull;
          return (
            <Text key={label} size="lg">
              <strong>{label}:</strong> {value}
            </Text>
          );
        }
      )}
    </Box>
  );
});
