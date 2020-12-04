import React, { memo, useMemo } from "react";
import { Box } from "@material-ui/core";

import { Loader } from "@gnosis.pm/safe-react-components";

import { StrategyState } from "types";

import { decimalFormat } from "utils/decimalFormat";
import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";

import { useTotalFunding } from "./useTotalFunding";

export type Props = {
  strategy: StrategyState;
};

export const DeployedParams = memo(function DeployedParams(
  props: Props
): JSX.Element {
  const { strategy } = props;

  const { totalFunding, isLoading: isTotalFundingLoading } = useTotalFunding(
    strategy
  );

  const totalFundingTuple = [
    "Total funding",
    isTotalFundingLoading ? <Loader size="xs" /> : totalFunding,
  ];

  const params = useMemo((): Array<any> => {
    const pendingAppendix = strategy.status === "PENDING" ? " to be" : "";

    if (!strategy.hasFetchedFunding) {
      return [];
    }

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
        `Total ${strategy.baseToken.symbol}${pendingAppendix} deposited`,
        `${formatSmart(strategy.baseFunding)}`,
      ],
      [
        `Total ${strategy.quoteToken.symbol}${pendingAppendix} deposited`,
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
