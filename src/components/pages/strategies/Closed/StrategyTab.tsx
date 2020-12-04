import React, { memo } from "react";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { StrategyState } from "types";

import { useCalculateValues } from "hooks/useCalculateValues";

import { formatSmart } from "utils/format";

import { DescriptionList } from "components/basic/display/DescriptionList";
import { PercentageIndicator } from "components/basic/display/StrategyTotalValue/PercentageIndicator";
import { Text } from "components/basic/display/Text";

const Wrapper = styled.div``;

export type Props = { strategy: StrategyState };

export const StrategyTab = memo(function StrategyTab(
  props: Props
): JSX.Element {
  const { strategy } = props;
  const {
    status,
    baseToken,
    quoteToken,
    baseBalance,
    quoteBalance,
    baseWithdrawn,
    quoteWithdrawn,
  } = strategy;

  const {
    totalValue,
    withdrawnValue,
    roi,
    apr,
    isLoading,
  } = useCalculateValues({
    strategy,
  });

  const isClosed = status === "CLOSED";
  const balancePrefix = isClosed ? "Claimed" : "Claimable";
  const loader = isLoading ? <Loader size="xs" /> : null;

  return (
    <Wrapper>
      <Text size="xl" color="rinkeby" strong>
        Strategy deactivated
      </Text>
      <DescriptionList size="lg">
        <dt>
          {balancePrefix} {baseToken?.symbol} balance:
        </dt>
        <dd>{formatSmart(isClosed ? baseWithdrawn : baseBalance)}</dd>
        <dt>
          {balancePrefix} {quoteToken?.symbol} balance:
        </dt>
        <dd>{formatSmart(isClosed ? quoteWithdrawn : quoteBalance)}</dd>
        <dt>Total value {balancePrefix.toLowerCase()}:</dt>
        <dd>
          {loader
            ? loader
            : withdrawnValue
            ? `~$${formatSmart(withdrawnValue)}`
            : totalValue
            ? `~$${formatSmart(totalValue)}`
            : "N/A"}
        </dd>
      </DescriptionList>
      <DescriptionList size="lg">
        <dt>Final ROI:</dt>
        <dd>
          <PercentageIndicator
            value={roi}
            size="lg"
            isLoading={isLoading}
            loaderSize="xs"
          />
        </dd>
        <dt>Final APR:</dt>
        <dd>
          <PercentageIndicator
            value={apr}
            size="lg"
            isLoading={isLoading}
            loaderSize="xs"
          />
        </dd>
      </DescriptionList>
    </Wrapper>
  );
});
