import React, { ComponentProps } from "react";
import styled from "styled-components";

import { ButtonLink as SRCButtonLink } from "@gnosis.pm/safe-react-components";

const Wrapper = styled(SRCButtonLink)`
  padding: 0;

  p {
    text-transform: uppercase;
    font-size: 0.75em;
    font-weight: bold;
  }
`;

export interface Props extends ComponentProps<typeof SRCButtonLink> {}

export const ButtonLink = (props: Props): ReturnType<typeof SRCButtonLink> => (
  <Wrapper {...props} />
);
