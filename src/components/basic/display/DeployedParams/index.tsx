import React, { memo, useMemo } from "react";

import { Loader } from "@gnosis.pm/safe-react-components";

import { StrategyState } from "types";

import { decimalFormat } from "utils/decimalFormat";
import { formatSmart } from "utils/format";

import { DescriptionList } from "components/basic/display/DescriptionList";

import { useTotalFunding } from "./useTotalFunding";

export type Props = {
  strategy: StrategyState;
};

export const DeployedParams = memo(function DeployedParams(
  props: Props
): JSX.Element {
  const { strategy } = props;

  const isStrategyLoading = !strategy.hasFetchedFunding;

  const { totalFunding, isLoading: isTotalFundingLoading } = useTotalFunding(
    strategy
  );

  const loader = useMemo(() => <Loader size="xs" />, []);

  const pendingAppendix = strategy.status === "PENDING" ? " to be" : "";

  return (
    <>
      <DescriptionList size="lg">
        <dt>Lowest price:</dt>
        <dd>
          {isStrategyLoading
            ? loader
            : decimalFormat(
                strategy.priceRange.lower,
                strategy.priceRange.token
              )}
        </dd>
        <dt>Highest price:</dt>
        <dd>
          {isStrategyLoading
            ? loader
            : decimalFormat(
                strategy.priceRange.upper,
                strategy.priceRange.token
              )}
        </dd>
      </DescriptionList>
      <DescriptionList size="lg">
        <dt>
          Total {strategy.baseToken.symbol}
          {pendingAppendix} deposited:
        </dt>
        <dd>
          {isStrategyLoading ? loader : formatSmart(strategy.baseFunding)}
        </dd>
        <dt>
          Total {strategy.quoteToken.symbol}
          {pendingAppendix} deposited:
        </dt>
        <dd>
          {isStrategyLoading ? loader : formatSmart(strategy.quoteFunding)}
        </dd>
        <dt>Total funding:</dt>
        <dd>{isTotalFundingLoading ? loader : totalFunding}</dd>
      </DescriptionList>
    </>
  );
});
