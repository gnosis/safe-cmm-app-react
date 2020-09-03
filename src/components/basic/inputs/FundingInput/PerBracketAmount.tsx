import React from "react";

import { TokenDisplay } from "components/basic/misc/TokenDisplay";
import { SubtextAmount } from "components/basic/misc/SubtextAmount";

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
          {amount} <TokenDisplay tokenAddress={tokenAddress} size="sm" />
        </>
      }
    />
  );
};
