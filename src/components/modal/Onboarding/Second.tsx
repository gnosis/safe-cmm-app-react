import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";

const List = styled.ul`
  list-style: none;
  width: 340px;
  margin: 0;

  li {
    margin-bottom: 5px;
  }
`;

export const Second = memo(function Second(): JSX.Element {
  return (
    <>
      <Text size="2xl" strong className="title">
        Some advantages of the CMM:
      </Text>
      <List>
        <li>
          <Text size="lg" as="span">
            ✔️ You can provide liquidity with just one token
          </Text>
        </li>
        <li>
          <Text size="lg" as="span">
            ✔️ Low to no maintenance required
          </Text>
        </li>
        <li>
          <Text size="lg" as="span">
            ✔️ Provide liquidity for a particular token on a self-defined price
            range
          </Text>
        </li>
        <li>
          <Text size="lg" as="span">
            ✔️ No gas costs after setting it up
          </Text>
        </li>
      </List>
    </>
  );
});
