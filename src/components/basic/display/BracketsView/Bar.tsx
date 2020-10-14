import React, { memo } from "react";
import styled from "styled-components";

import { Needle } from "./Needle";
import { Brackets } from "./Brackets";

const Wrapper = styled.div`
  width: inherit;
  height: 46px;
  position: relative;
`;

export const Bar = memo(function Bar(): JSX.Element {
  return (
    <Wrapper>
      <Needle />
      <Brackets />
    </Wrapper>
  );
});
