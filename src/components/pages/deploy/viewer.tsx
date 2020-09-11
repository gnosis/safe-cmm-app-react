import React, { memo, createContext } from "react";
import { Container } from "@material-ui/core";
import styled from "styled-components";

import { Button, Icon } from "@gnosis.pm/safe-react-components";

import { MarketPrice } from "components/basic/display/MarketPrice";
import { TokenSelector } from "components/basic/inputs/TokenSelector";
import { PriceInput } from "components/basic/inputs/PriceInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";
import { FundingInput } from "components/basic/inputs/FundingInput";
import {
  Props as MessageProps,
  Message,
} from "components/basic/display/Message";

import { SideBar } from "./SideBar";
import { TokenSelectorsFragment } from "./TokenSelectorsFragment";
import { PricesFragment } from "./PricesFragment";
import { MarketPriceFragment } from "./MarketPriceFragment";
import { ErrorMessagesFragment } from "./ErrorMessagesFragment";
import { DeployStrategyButtonFragment } from "./DeployStrategyButtonFragment";

const PageLayout = styled.div`
  display: flex;
  min-width: 860px;
`;

const DeployWidget = styled.div`
  // basic dimensions
  max-width: 444px;
  min-height: 482px;

  padding: 16px 13px;

  // Some space for sidebar
  margin-right: 48px;

  // Spacing between elements
  & > *:not(:last-child) {
    margin-bottom: 16px;
  }

  // fancy border
  border-radius: 16px;
  box-shadow: 0 20px 24px 0 rgba(0, 20, 40, 0.05),
    0 0 10px 0 rgba(0, 20, 40, 0.08);

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export interface Props {
  baseTokenAddress?: string;
  quoteTokenAddress?: string;
  onBaseTokenSelect: (address: string) => void;
  onQuoteTokenSelect: (address: string) => void;
  lowestPrice?: string;
  highestPrice?: string;
  startPrice?: string;
  baseTokenAmount?: string;
  baseTokenAmountPerBracket?: string;
  quoteTokenAmount?: string;
  quoteTokenAmountPerBracket?: string;
  messages?: MessageProps[];
}

// TODO: This feels dumb.
// I want to have things on the context that are required but are not available when I create the context
// Will I have to make them optional and always check their existence later?
function dummyOnSelect(_: string): void {}

export const initialContext: Props = {
  onBaseTokenSelect: dummyOnSelect,
  onQuoteTokenSelect: dummyOnSelect,
};

export const DeployPageContext = createContext<Props>(initialContext);

/**
 * All component props are passed down into a local context
 * Every fragment takes what is needs from it
 */
function component(props: Props): JSX.Element {
  return (
    <DeployPageContext.Provider value={props}>
      <PageLayout>
        <DeployWidget>
          <TokenSelectorsFragment />
          <MarketPriceFragment />
          <PricesFragment />
          <ErrorMessagesFragment />
          <DeployStrategyButtonFragment />
        </DeployWidget>
        <SideBar />
      </PageLayout>
    </DeployPageContext.Provider>
  );
}

export const DeployPageViewer = memo(component);
