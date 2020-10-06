import React, { memo } from "react";
import styled from "styled-components";
import { Field, useForm } from "react-final-form";

import { Icon } from "@gnosis.pm/safe-react-components";

import { TokenSelector } from "components/basic/inputs/TokenSelector";
import { Link } from "components/basic/inputs/Link";

import { isRequired } from "validators/isRequired";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .swapIcon {
    transform: rotate(90deg);
  }
`;

export const TokenSelectorsFragment = memo(
  function TokenSelectorsFragment(): JSX.Element {
    const {
      mutators: { swapTokens },
    } = useForm();

    return (
      <Wrapper>
        <Field<string>
          name="baseTokenAddress"
          validate={isRequired()("Token A")}
          render={({ input }) => (
            <TokenSelector
              label="Pick Token A"
              tooltip="This is the token that will be used to buy token B"
              onSelect={input.onChange}
              selectedTokenAddress={input.value}
            />
          )}
        />
        <Link onClick={swapTokens} textSize="sm" color="text">
          <Icon type="transactionsInactive" size="md" className="swapIcon" />
        </Link>
        <Field<string>
          name="quoteTokenAddress"
          validate={isRequired()("Token B")}
          render={({ input }) => (
            <TokenSelector
              label="Pick Token B"
              tooltip="This is the token that will be sold for token A"
              onSelect={input.onChange}
              selectedTokenAddress={input.value}
            />
          )}
        />
      </Wrapper>
    );
  }
);
