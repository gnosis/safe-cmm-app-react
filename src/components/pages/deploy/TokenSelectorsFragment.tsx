import React, { memo, useCallback } from "react";
import { RecoilState, useRecoilCallback, useRecoilValue } from "recoil";
import styled from "styled-components";

import { Icon } from "@gnosis.pm/safe-react-components";

import { TokenSelector } from "components/basic/inputs/TokenSelector";
import { Link } from "components/basic/inputs/Link";

import { baseTokenAddressAtom, quoteTokenAddressAtom } from "./atoms";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .swapIcon {
    transform: rotate(90deg);
  }
`;

function component(): JSX.Element {
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);

  const swapTokens = useRecoilCallback(({ snapshot, set }) => async (): Promise<
    void
  > => {
    const [currBase, currQuote] = await Promise.all([
      snapshot.getPromise(baseTokenAddressAtom),
      snapshot.getPromise(quoteTokenAddressAtom),
    ]);
    set(quoteTokenAddressAtom, currBase);
    set(baseTokenAddressAtom, currQuote);
  });

  const onSelectTokenFactory = useRecoilCallback(
    ({ snapshot, set }) => (
      currentSelectAtom: RecoilState<string>,
      oppositeSelectAtom: RecoilState<string>
    ) => async (address: string): Promise<void> => {
      const oppositeValue = await snapshot.getPromise(oppositeSelectAtom);

      if (address === oppositeValue) {
        swapTokens();
      } else {
        set(currentSelectAtom, address);
      }
    }
  );

  const onBaseTokenSelect = useCallback(
    onSelectTokenFactory(baseTokenAddressAtom, quoteTokenAddressAtom),
    []
  );
  const onQuoteTokenSelect = useCallback(
    onSelectTokenFactory(quoteTokenAddressAtom, baseTokenAddressAtom),
    []
  );

  return (
    <Wrapper>
      <TokenSelector
        label="Pick Token A"
        tooltip="This is the token that will be used to buy token B"
        onSelect={onBaseTokenSelect}
        selectedTokenAddress={baseTokenAddress}
      />
      <Link onClick={swapTokens} textSize="sm" color="text">
        <Icon type="transactionsInactive" size="md" className="swapIcon" />
      </Link>
      <TokenSelector
        label="Pick Token B"
        tooltip="This is the token that will be sold for token A"
        onSelect={onQuoteTokenSelect}
        selectedTokenAddress={quoteTokenAddress}
      />
    </Wrapper>
  );
}

export const TokenSelectorsFragment = memo(component);
