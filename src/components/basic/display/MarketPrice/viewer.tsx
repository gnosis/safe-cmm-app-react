import React, { useMemo, memo } from "react";
import styled from "styled-components";

import { Text, Icon, Loader } from "@gnosis.pm/safe-react-components";

import { TokenDetails } from "types";

import { SubtextAmount } from "components/basic/display/SubtextAmount";
import { TokenDisplay } from "components/basic/display/TokenDisplay";
import { Tooltip } from "components/basic/display/Tooltip";
import { Link } from "components/basic/inputs/Link";

const Amount = styled.span`
  display: grid;
  grid-template-columns: repeat(5, auto);
  column-gap: 0.25em;
  align-items: center;
`;

export interface MarketPriceViewerProps {
  price?: string;
  isPriceLoading: boolean;
  priceUrl: string;
  baseTokenAddress?: string;
  quoteTokenAddress?: string;
}

function component(props: MarketPriceViewerProps): JSX.Element {
  const {
    price,
    isPriceLoading,
    priceUrl,
    baseTokenAddress,
    quoteTokenAddress,
  } = props;

  const amount = useMemo((): JSX.Element | string => {
    if (isPriceLoading) {
      return <Loader size="xs" />;
    } else if (!price) {
      return "-";
    } else {
      return (
        <Amount>
          <Link
            color={priceUrl ? "primary" : "disabled"}
            href={priceUrl}
            textSize="md"
          >
            {price}
          </Link>
          <TokenDisplay token={quoteTokenAddress} size="md" />
          <Text size="md">per</Text>
          <TokenDisplay token={baseTokenAddress} size="md" />
          <Tooltip title="TODO: add tooltip!!">
            <Icon type="question" size="sm" />
          </Tooltip>
        </Amount>
      );
    }
  }, [price, priceUrl, baseTokenAddress, quoteTokenAddress, isPriceLoading]);

  return <SubtextAmount subtext="Market price:" amount={amount} inline />;
}

export const MarketPriceViewer = memo(component);
