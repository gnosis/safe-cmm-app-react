import React, { memo } from "react";
import styled from "styled-components";

import { StrategyState } from "types";
import { WithdrawButton } from "../Active/WithdrawButton";

import { ButtonGroup } from "@material-ui/core";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface Props {
  strategy: StrategyState;
}

export const Details = memo(function Details({ strategy }: Props): JSX.Element {
  return (
    <>
      <Header>
        <ButtonGroup>
          <WithdrawButton strategy={strategy} />
        </ButtonGroup>
      </Header>
    </>
  );
});
