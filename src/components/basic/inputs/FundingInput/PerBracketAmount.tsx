import React, { memo, useMemo } from "react";
import BN from "bn.js";

import { formatSmart, parseAmount } from "@gnosis.pm/dex-js";

import { useTokenDetails } from "hooks/useTokenDetails";

import { TokenDisplay } from "components/basic/display/TokenDisplay";
import { SubtextAmount } from "components/basic/display/SubtextAmount";

export interface Props {
  totalAmount: string;
  brackets?: number;
  tokenAddress: string;
}

function UPerBracketAmount(props: Props): JSX.Element {
  const { totalAmount, brackets = 0, tokenAddress } = props;

  const tokenDetails = useTokenDetails(tokenAddress);

  const amountPerBracket = useMemo((): string => {
    if (!tokenDetails || !totalAmount || !brackets || +totalAmount <= 0) {
      return "";
    }
    const amountInTokenUnits = parseAmount(totalAmount, tokenDetails.decimals);

    if (amountInTokenUnits == null) {
      return "";
    }

    const amountPerBracket = amountInTokenUnits.div(new BN(brackets));

    return formatSmart({
      amount: amountPerBracket,
      precision: tokenDetails.decimals,
    });
  }, [tokenDetails, totalAmount, brackets]);

  const subtext = brackets
    ? `${brackets} bracket${brackets > 1 ? "s" : ""} w/ each:`
    : `0 brackets`;

  return (
    <SubtextAmount
      subtext={subtext}
      amount={
        amountPerBracket ? (
          <>
            {amountPerBracket} <TokenDisplay token={tokenAddress} size="sm" />
          </>
        ) : (
          <strong>-</strong>
        )
      }
    />
  );
}

export const PerBracketAmount: typeof UPerBracketAmount = memo(
  UPerBracketAmount
);
