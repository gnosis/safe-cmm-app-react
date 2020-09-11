import React, { memo } from "react";
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

const Wrapper = styled.div`
  display: flex;
  min-width: 860px;

  & > div:first-child {
    margin-right: 48px;
  }
`;

const Widget = styled.div`
  // basic dimensions
  max-width: 444px;
  min-height: 482px;

  padding: 16px 13px;

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

  // TODO: move out
  .tokenSelectors {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > span > svg {
      transform: rotate(90deg);
    }
  }

  .marketPrice {
    align-self: center;
  }

  // TODO: move out
  .prices {
    display: flex;
    justify-content: space-between;

    & > div {
      padding: 16px 13px;

      & > div:first-child {
        margin-bottom: 15px;
      }
    }

    & > div:first-child {
      padding-left: 0;
    }
    & > div:last-child {
      padding-right: 0;
    }

    .middle {
      padding-top: 13px;
      border: 1px solid #e8e7e6;
      border-radius: 16px;
    }
  }

  // TODO: move out
  .messages {
    & > * {
      margin-bottom: 5px;
    }
    & > :last-child {
      margin-bottom: 0;
    }
  }

  > button {
    border-radius: 16px;
    font-weight: bold;
  }
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

function component(props: Props): JSX.Element {
  const {
    baseTokenAddress,
    quoteTokenAddress,
    onBaseTokenSelect,
    onQuoteTokenSelect,
    lowestPrice,
    highestPrice,
    startPrice,
    baseTokenAmount,
    baseTokenAmountPerBracket,
    quoteTokenAmount,
    quoteTokenAmountPerBracket,
    messages,
  } = props;

  return (
    <Wrapper>
      <Widget>
        <div className="tokenSelectors">
          {/* TODO: split out into separated file */}
          <TokenSelector
            label="Pick Token A"
            tooltip="This is the token that will be used to buy token B"
            onSelect={onBaseTokenSelect}
          />
          <Icon type="transactionsInactive" size="md" />
          <TokenSelector
            label="Pick Token B"
            tooltip="This is the token that will be sold for token A"
            onSelect={onQuoteTokenSelect}
          />
        </div>
        <div className="marketPrice">
          <MarketPrice
            baseTokenAddress={baseTokenAddress}
            quoteTokenAddress={quoteTokenAddress}
          />
        </div>
        <div className="prices">
          {/* TODO: split out into separated file */}
          <div>
            <PriceInput
              tokenAddress={baseTokenAddress}
              labelText="Lowest price"
              labelTooltip="The lowest price our strategy covers, lower than this you hold 100% token B"
              value={lowestPrice}
            />
            <FundingInput
              amountPerBracket={baseTokenAmountPerBracket}
              tokenAddress={baseTokenAddress}
              value={baseTokenAmount}
            />
          </div>
          <div className="middle">
            <PriceInput
              tokenAddress={baseTokenAddress}
              labelText="Start Price"
              labelTooltip="Bellow the start price, brackets will be funded with token A. Above the start price, brackets will be funded with token B."
              value={startPrice}
              labelSize="xl"
            />
            <TotalBrackets />
          </div>
          <div>
            <PriceInput
              tokenAddress={baseTokenAddress}
              labelText="Highest price"
              labelTooltip="The max price per token A you are willing to sell or buy"
              value={highestPrice}
            />
            <FundingInput
              amountPerBracket={quoteTokenAmountPerBracket}
              tokenAddress={quoteTokenAddress}
              value={quoteTokenAmount}
            />
          </div>
        </div>
        {messages && (
          <div className="messages">
            {messages.map((msgProps) => (
              <Message {...msgProps} />
            ))}
          </div>
        )}
        <Button type="submit" size="lg" color="primary" variant="contained">
          Deploy Strategy
        </Button>
      </Widget>
      <SideBar />
    </Wrapper>
  );
}

export const DeployPageViewer = memo(component);
