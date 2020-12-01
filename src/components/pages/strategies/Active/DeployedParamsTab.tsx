import React, { memo, useMemo } from "react";
import Decimal from "decimal.js";
import { Box } from "@material-ui/core";

import { StrategyState } from "types";

import { decimalFormat, decimalTruncatedString } from "utils/decimalFormat";

import { Text } from "components/basic/display/Text";

export type Props = {
  strategy: StrategyState;
};

export const DeployedParamsTab = memo(function DeployedParamsTab(
  props: Props
): JSX.Element {
  const { strategy } = props;

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
        `Funding per bracket > ${strategy.baseToken.symbol}`,
        `${decimalTruncatedString(
          strategy.baseFunding
            .div(Math.pow(10, strategy.baseToken.decimals))
            .div(strategy.brackets.length)
        )}`,
      ],
      [
        `Funding per bracket > ${strategy.quoteToken.symbol}`,
        `${decimalTruncatedString(
          strategy.quoteFunding
            .div(Math.pow(10, strategy.baseToken.decimals))
            .div(strategy.brackets.length)
        )}`,
      ],
    ];
  }, [strategy]);

  return (
    <Box>
      {params.map(
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
