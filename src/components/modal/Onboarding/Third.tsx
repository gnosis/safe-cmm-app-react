import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";

import spread from "img/spread.png";

const Contents = styled.div`
  display: flex;
  justify-content: space-between;

  & > img {
    margin-right: 25px;
    height: 174px;
    width: 176px;
  }

  p:first-child {
    margin-bottom: 20px;
  }
`;

export const Third = memo(function Third(): JSX.Element {
  return (
    <>
      <Text size="2xl" strong className="title">
        How it works
      </Text>
      <Contents>
        <img src={spread} />
        <span>
          <Text size="lg">
            The CMM deploys a set of Ethereum addresses that places a buy-low
            and a sell-high order around price ranges (each called a “bracket”).
          </Text>
          <Text size="lg">
            Every time the price goes through a bracket and activates both
            orders, the CMM provider earns the spread.
          </Text>
        </span>
      </Contents>
    </>
  );
});
