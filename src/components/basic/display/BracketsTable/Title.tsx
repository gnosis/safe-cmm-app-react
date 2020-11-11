import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";
import { TokenDisplay } from "components/basic/display/TokenDisplay";

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: 10px;

  & > :not(:last-child) {
    margin-right: 5px;
  }
`;

const Dot = styled.div<{ isLeft: boolean }>`
  height: 8px;
  width: 8px;
  border-radius: 4px;
  background-color: ${({ isLeft, theme }) =>
    theme.colors[isLeft ? "borderDarkGreen" : "borderDarkPurple"]};
`;

type Props = {
  tokenAddress: string;
  bracketsCount: number;
  isLeft: boolean;
};

export const Title = memo(function Title(props: Props): JSX.Element {
  const { tokenAddress, bracketsCount, isLeft } = props;

  return (
    <Wrapper>
      <Dot isLeft={isLeft} />
      <TokenDisplay token={tokenAddress} size="md" />
      <Text size="md" as="span">
        - {bracketsCount} bracket{bracketsCount > 1 ? "s" : ""}
      </Text>
    </Wrapper>
  );
});
