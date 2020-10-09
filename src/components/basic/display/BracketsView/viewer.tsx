import React, { memo } from "react";
import styled from "styled-components";
import { range } from "lodash";
import { TokenDisplay } from "../TokenDisplay";
import { Text } from "@gnosis.pm/safe-react-components";

type PageType = "deploy" | "strategy";

type WrapperProps = {
  hasLeft: boolean;
};

const LEFT_BACKGROUND_COLOR = "rgba(0, 156, 180, 0.1)";
const RIGHT_BACKGROUND_COLOR = "rgba(128, 94, 255, 0.1)";
const LEFT_BORDER_LIGHT = "2px solid rgba(0, 156, 180, 0.2)";
const LEFT_BORDER_THICK = "2px solid #009cb4";
const RIGHT_BORDER_LIGHT = "2px solid rgba(128, 94, 255, 0.2)";
const RIGHT_BORDER_THICK = "2px solid #805eff";
const MIDDLE_BORDER = "";

const Wrapper = styled.div<WrapperProps>`
  height: 90px;

  /* TODO: Shared between header/footer */
  .justifyRight {
    text-align: right;
    justify-content: right;
  }

  /* TODO: Header quite similar to footer, refactor single comp */
  .header {
    display: flex;
    justify-content: space-between;
    height: 16px;
    margin-bottom: 0.1em;

    & > * {
      width: 100%;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    height: 14px;
    margin-top: 0.4em;

    & > * {
      width: 100%;
    }
  }

  /* TODO: Refactor into own component */
  .container {
    width: inherit;
    height: 46px;

    display: flex;

    & > * {
      width: 100%;
    }

    /* Default to left side color */
    background-color: ${LEFT_BACKGROUND_COLOR};

    .left:first-of-type {
      border-left: ${LEFT_BORDER_THICK};
    }

    .left {
      border-right: ${LEFT_BORDER_LIGHT};
    }

    .left:last-of-type {
      border-right: ${LEFT_BORDER_THICK};
    }

    ${({ hasLeft }) =>
      hasLeft
        ? ""
        : `
      .right:first-of-type {
        border-left: ${RIGHT_BORDER_THICK};
      }`}

    .right {
      background-color: ${RIGHT_BACKGROUND_COLOR};

      border-right: ${RIGHT_BORDER_LIGHT};
    }

    .right:last-of-type {
      border-right: ${RIGHT_BORDER_THICK};
    }
  }
`;

export type Props = {
  baseTokenAddress?: string;
  quoteTokenAddress?: string;

  totalBrackets?: number;
  leftBrackets?: number;
  rightBrackets?: number;

  lowestPrice?: string;
  startPrice?: string;
  highestPrice?: string;

  type: PageType;
};

type PriceDisplayProps = {
  price?: string;
  token?: string;
  className?: string;
};

function PriceDisplay(props: PriceDisplayProps): JSX.Element {
  const { price, token, className } = props;
  return (
    // TODO: clear up inline styles
    <div className={className} style={{ display: "flex" }}>
      <Text size="sm" as="span" style={{ paddingRight: "0.25em" }}>
        {price}
      </Text>
      <TokenDisplay token={token} size="sm" />
    </div>
  );
}

export const BracketsViewView = memo(function BracketsViewView(
  props: Props
): JSX.Element {
  const {
    totalBrackets = 1,
    leftBrackets = 0,
    rightBrackets = 0,

    baseTokenAddress,
    quoteTokenAddress,

    lowestPrice,
    highestPrice,
  } = props;

  return (
    <Wrapper hasLeft={!!leftBrackets}>
      <div className="header">
        {baseTokenAddress && (
          <TokenDisplay token={baseTokenAddress} size="sm" />
        )}
        {quoteTokenAddress && (
          <TokenDisplay
            token={quoteTokenAddress}
            size="sm"
            className="justifyRight"
          />
        )}
      </div>
      <div className="container">
        {range(
          !leftBrackets && !rightBrackets ? totalBrackets : leftBrackets
        ).map((id) => (
          <div className="left" key={id} />
        ))}
        {range(rightBrackets).map((id) => (
          <div className="right" key={id + leftBrackets} />
        ))}
      </div>
      <div className="footer">
        {lowestPrice && (
          <PriceDisplay price={lowestPrice} token={baseTokenAddress} />
        )}
        {highestPrice && (
          <PriceDisplay
            price={highestPrice}
            token={baseTokenAddress}
            className="justifyRight"
          />
        )}
      </div>
    </Wrapper>
  );
});
