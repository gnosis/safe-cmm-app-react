import React, { useMemo } from "react";
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
  tokenA?: TokenDetails;
  tokenB?: TokenDetails;
}

export const MarketPriceViewer = (
  props: MarketPriceViewerProps
): JSX.Element => {
  const { price, isPriceLoading, priceUrl, tokenA, tokenB } = props;

  // TODO: should this come as a string on props?

  const amount = useMemo(
    (): JSX.Element | string =>
      isPriceLoading ? (
        <Loader size="xs" />
      ) : !price ? (
        "-"
      ) : (
        <Amount>
          <Link
            color={priceUrl ? "primary" : "disabled"}
            href={priceUrl}
            textSize="md"
          >
            {price}
          </Link>
          <TokenDisplay token={tokenA} size="md" />
          <Text size="md">per</Text>
          <TokenDisplay token={tokenB} size="md" />
          <Tooltip title="TODO: add tooltip!!">
            <Icon type="question" size="sm" />
          </Tooltip>
        </Amount>
      ),
    [price, priceUrl, tokenA, tokenB, isPriceLoading]
  );

  return <SubtextAmount subtext="Market price:" amount={amount} inline />;
};
