import React, { memo } from "react";
import styled from "styled-components";

import { Icon, Loader } from "@gnosis.pm/safe-react-components";

import { Text } from "components/basic/display/Text";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  & > *:not(:last-child) {
    margin-right: 5px;
  }
`;

export type Props = {
  loaded: number;
  total: number;
  isLoading: boolean;
};

export const Header = memo(function Header(props: Props): JSX.Element {
  const { loaded, total, isLoading } = props;

  return (
    <Wrapper>
      <Icon type="transactionsInactive" size="md" color="primary" />
      <Text color="primary" size="2xl" as="span">
        Last {loaded} trades
      </Text>
      <Text color="secondaryHover" as="span">
        ({total} total)
      </Text>
      {isLoading && <Loader size="xs" />}
    </Wrapper>
  );
});
