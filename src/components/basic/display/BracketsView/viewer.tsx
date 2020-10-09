import React, { memo } from "react";
import styled from "styled-components";
import { range } from "lodash";
import { TokenDisplay } from "../TokenDisplay";
import { Text } from "@gnosis.pm/safe-react-components";

type PageType = "deploy" | "strategy";

type WrapperProps = {
  hasLeft: boolean;
  needlePosition?: number;
};

const LEFT_BACKGROUND_COLOR = "rgba(0, 156, 180, 0.1)";
const RIGHT_BACKGROUND_COLOR = "rgba(128, 94, 255, 0.1)";
const LEFT_BORDER_LIGHT = "2px solid rgba(0, 156, 180, 0.2)";
const LEFT_BORDER_THICK = "2px solid #009cb4";
const RIGHT_BORDER_LIGHT = "2px solid rgba(128, 94, 255, 0.2)";
const RIGHT_BORDER_THICK = "2px solid #805eff";
const NEEDLE_BORDER = "1px dashed #008C73";

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

  .bar {
    width: inherit;
    height: 46px;
    position: relative;
  }

  /* TODO: refactor into own component */
  ${({ needlePosition = 50 }) => `
  .needle {
    height: inherit;
    width: 0;

    border: ${NEEDLE_BORDER};
    border-top: 0;
    border-bottom: 0;

    position: absolute;
    left: ${needlePosition}%;

    display: flex;
    flex-direction: column;
    align-items: ${
      needlePosition < 20
        ? "flex-start"
        : needlePosition > 80
        ? "flex-end"
        : "center"
    };

    .label {
      text-transform: uppercase;

      position: absolute;
      width: max-content;
      top: -1.6em;
      ${needlePosition < 20 ? `left: 30px;` : ""}
      ${needlePosition > 80 ? `right: 30px;` : ""}
    }

    .price {
      position: absolute;
      width: max-content;
      bottom: -20px;
      ${needlePosition < 20 ? `left: 30px;` : ""}
      ${needlePosition > 80 ? `right: 30px;` : ""}

    }
  }
  `}

  /* TODO: Refactor into own component */
  .container {
    height: inherit;
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
  color?: "primary" | "text";
  className?: string;
  adornment?: "left" | "right";
};

const PriceDisplayWrapper = styled.div`
  display: flex;

  & > *:not(:last-child) {
    margin-right: 0.25em;
  }
`;

function PriceDisplay(props: PriceDisplayProps): JSX.Element {
  const { price, token, className, color = "text", adornment } = props;
  return (
    // TODO: clear up inline styles
    <PriceDisplayWrapper className={className}>
      {adornment === "left" && (
        <Text size="sm" as="span" color={color}>
          &lt;
        </Text>
      )}
      <Text size="sm" as="span" color={color}>
        {price}
      </Text>
      <TokenDisplay token={token} size="sm" color={color} />
      {!!adornment && (
        <Text size="sm" color="rinkeby">
          (out of range)
        </Text>
      )}
      {adornment === "right" && (
        <Text size="sm" as="span" color={color}>
          &gt;
        </Text>
      )}
    </PriceDisplayWrapper>
  );
}

/**
 * Calculates needle position as a percentage.
 * Percentage can be negative or greater than 100.
 * Returns undefined when input is invalid
 *
 * @param startPrice Start price string
 * @param lowestPrice Lowest Price string
 * @param highestPrice Highest Price string
 */
function calculateNeedlePosition(
  startPrice?: string,
  lowestPrice?: string,
  highestPrice?: string
): number | undefined {
  const sp = Number(startPrice);
  const lp = Number(lowestPrice);
  const hp = Number(highestPrice);

  if (isNaN(sp) || isNaN(lp) || isNaN(hp) || lp >= hp) {
    return undefined;
  }

  return (100 * (sp - lp)) / (hp - lp);
}

function NeedleLabel({
  label,
  adornment,
  className,
}: {
  label: string;
  adornment?: "left" | "right";
  className?: string;
}): JSX.Element {
  return (
    <Text as="span" size="sm" color="primary" strong className={className}>
      {adornment === "left" && "<"} {label} {adornment === "right" && ">"}
    </Text>
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

    startPrice,
    lowestPrice,
    highestPrice,

    type,
  } = props;

  const needlePosition = calculateNeedlePosition(
    startPrice,
    lowestPrice,
    highestPrice
  );
  const needleBelow0 = needlePosition && needlePosition < 0;
  const needleAbove100 = !needleBelow0 && needlePosition > 100;

  const labelText = type === "deploy" ? "START PRICE" : "MARKET PRICE";

  return (
    <Wrapper hasLeft={!!leftBrackets} needlePosition={needlePosition}>
      <div className="header">
        {needleBelow0 ? (
          <NeedleLabel label={labelText} adornment="left" />
        ) : (
          baseTokenAddress && (
            <TokenDisplay token={baseTokenAddress} size="sm" />
          )
        )}
        {needleAbove100 ? (
          <NeedleLabel
            label={labelText}
            adornment="right"
            className="justifyRight"
          />
        ) : (
          quoteTokenAddress && (
            <TokenDisplay
              token={quoteTokenAddress}
              size="sm"
              className="justifyRight"
            />
          )
        )}
      </div>
      <div className="bar">
        {!needleBelow0 && !needleAbove100 && (
          <div className="needle">
            <NeedleLabel label={labelText} className="label" />
            {startPrice && (
              <PriceDisplay
                price={startPrice}
                token={baseTokenAddress}
                color="primary"
                className="price"
              />
            )}
          </div>
        )}
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
      </div>
      <div className="footer">
        {needleBelow0
          ? startPrice && (
              <PriceDisplay
                price={startPrice}
                token={baseTokenAddress}
                adornment="left"
                color="primary"
              />
            )
          : lowestPrice && (
              <PriceDisplay price={lowestPrice} token={baseTokenAddress} />
            )}
        {needleAbove100
          ? startPrice && (
              <PriceDisplay
                price={startPrice}
                token={baseTokenAddress}
                adornment="right"
                color="primary"
                className="justifyRight"
              />
            )
          : highestPrice && (
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
