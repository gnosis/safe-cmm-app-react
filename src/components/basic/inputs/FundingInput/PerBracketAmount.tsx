import React from "react";

import { TokenDisplay } from "components/basic/display/TokenDisplay";
import { SubtextAmount } from "components/basic/display/SubtextAmount";

export interface Props {
  amount: string;
  tokenAddress: string;
}

export const PerBracketAmount = (props: Props): JSX.Element => {
  const { amount, tokenAddress } = props;

  return (
    <SubtextAmount
      subtext="per bracket"
      amount={
        <>
          {amount} <TokenDisplay token={tokenAddress} size="sm" />
        </>
      }
    />
  );
};
