import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { useField, useForm } from "react-final-form";

import { MarketPrice } from "components/basic/display/MarketPrice";

const Wrapper = styled.div`
  align-self: center;
`;

function component(): JSX.Element {
  const {
    input: { value: baseTokenAddress },
  } = useField<string>("baseTokenAddress");
  const {
    input: { value: quoteTokenAddress },
  } = useField<string>("quoteTokenAddress");

  const {
    mutators: { setFieldValue },
  } = useForm();

  const onPriceClick = useCallback(
    (price: string) => {
      setFieldValue("startPrice", { value: price });
    },
    [setFieldValue]
  );

  return (
    <Wrapper>
      <MarketPrice
        baseTokenAddress={baseTokenAddress}
        quoteTokenAddress={quoteTokenAddress}
        onPriceClick={onPriceClick}
      />
    </Wrapper>
  );
}

export const MarketPriceFragment = memo(component);
