import React from "react";

import { Box, Typography } from "@material-ui/core";
import Strategy from "logic/strategy";
import { memo, useMemo } from "react";
import Decimal from "decimal.js";

export type Props = {
  strategy: Strategy;
};

export const DeployedParamsTab = memo(function DeployedParamsTab(
  props: Props
): JSX.Element {
  const { strategy } = props;

  const params = useMemo((): Array<any> => {
    return [
      [
        "Lowest Price",
        `${strategy.priceRange.lower.toSD(4).toString()} ${
          strategy.priceRange.token.symbol
        }`,
      ],
      [
        "Price Range",
        `${strategy.priceRange.lower.toSD(4).toString()} ${
          strategy.priceRange.token.symbol
        } - ${strategy.priceRange.upper.toSD(4).toString()} ${
          strategy.priceRange.token.symbol
        }`,
      ],
      [
        "Highest Price",
        `${strategy.priceRange.upper.toSD(4).toString()} ${
          strategy.priceRange.token.symbol
        }`,
      ],
      null, // separator
      [
        "Funding per bracket > TOKEN A",
        `${new Decimal(strategy.baseFunding)
          .div(Math.pow(10, strategy.baseTokenDetails.decimals))
          .div(strategy.brackets.length)
          .toSD(4)
          .toString()}`,
      ],
      [
        "Funding per bracket > TOKEN B",
        `${new Decimal(strategy.quoteFunding)
          .div(Math.pow(10, strategy.quoteTokenDetails.decimals))
          .div(strategy.brackets.length)
          .toSD(4)
          .toString()}`,
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
            <Typography key={label}>
              <strong>{label}:</strong> {value}
            </Typography>
          );
        }
      )}
    </Box>
  );
});
