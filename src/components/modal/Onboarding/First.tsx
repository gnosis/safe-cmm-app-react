import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";
import { Link } from "components/basic/inputs/Link";

import logo from "img/appIcon.svg";

const Logo = styled.img`
  height: 74px;
  width: 74px;
  margin-bottom: 24px;
`;

export const First = memo(function First(): JSX.Element {
  return (
    <>
      <Logo src={logo} />
      <span>
        <Text as="span" size="2xl" strong color="primary">
          Buy
        </Text>{" "}
        <Text as="span" size="2xl" strong>
          volatile asset low.
        </Text>
      </span>
      <span className="title">
        <Text as="span" size="2xl" strong color="error">
          Sell
        </Text>{" "}
        <Text as="span" size="2xl" strong>
          volatile asset high.
        </Text>
      </span>
      <Text size="lg" center>
        The Custom Market Maker (CMM) enables users to provide liquidity without
        maintenance, similar to automated market makers (AMM) like Uniswap and
        Balancer. It is based on the{" "}
        <Link textSize="lg" href="https://gnosis.io/protocol/" color="primary">
          Gnosis Protocol DEX.
        </Link>
      </Text>
    </>
  );
});
