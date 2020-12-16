import React, { useMemo } from "react";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { DEFAULT_INPUT_WIDTH } from "utils/constants";
import { safeAddDecimals } from "utils/calculations";
import { formatSmart } from "utils/format";

import { useAmountInUsd } from "hooks/useAmountInUsd";

import {
  BracketsInput,
  Props as BracketsInputProps,
} from "components/basic/inputs/BracketsInput";
import { TextWithTooltip } from "components/basic/display/TextWithTooltip";
import { SubtextAmount } from "components/basic/display/SubtextAmount";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export interface Props extends Omit<BracketsInputProps, "customLabel"> {
  baseTokenAddress: string;
  baseTokenAmount: string;
  quoteTokenAddress: string;
  quoteTokenAmount: string;
}

export const TotalBrackets = (props: Props): JSX.Element => {
  const {
    baseTokenAddress,
    baseTokenAmount,
    quoteTokenAddress,
    quoteTokenAmount,
    ...rest
  } = props;

  // TODO: propagate error
  const {
    amountInUsd: baseAmountInUsd,
    isLoading: isBaseAmountLoading,
  } = useAmountInUsd({
    tokenAddress: baseTokenAddress,
    amount: baseTokenAmount,
  });
  const {
    amountInUsd: quoteAmountInUsd,
    isLoading: isQuoteAmountLoading,
  } = useAmountInUsd({
    tokenAddress: quoteTokenAddress,
    amount: quoteTokenAmount,
  });

  const amount = useMemo((): React.ReactNode => {
    if (isBaseAmountLoading || isQuoteAmountLoading) {
      return <Loader size="xs" />;
    }

    const totalAmount = safeAddDecimals(baseAmountInUsd, quoteAmountInUsd);

    if (baseAmountInUsd || quoteAmountInUsd) {
      return `~ $${
        totalAmount && !totalAmount.isNaN() ? formatSmart(totalAmount) : ""
      }`;
    } else {
      return "-";
    }
  }, [
    baseAmountInUsd,
    isBaseAmountLoading,
    isQuoteAmountLoading,
    quoteAmountInUsd,
  ]);

  return (
    <Wrapper>
      <BracketsInput
        {...rest}
        width={DEFAULT_INPUT_WIDTH}
        inputWidth="75px"
        center
        customLabel={
          <TextWithTooltip
            tooltip="Each bracket consists of a single Ethereum address that places a buy-low and a sell-high order. Every time the price goes through a bracket and activates both orders, the CMM provider earns the spread."
            size="lg"
          >
            Total Brackets
          </TextWithTooltip>
        }
      />
      <SubtextAmount subtext="Total funding:" amount={amount} />
    </Wrapper>
  );
};
