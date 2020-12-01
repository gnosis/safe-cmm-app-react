import React, { memo } from "react";
import styled from "styled-components";

import { Button } from "@gnosis.pm/safe-react-components";

import { Link } from "components/basic/inputs/Link";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  & > * {
    width: 200px;
    height: 36px;
  }
`;

export type Props = { buttonText: string; onNextClick: () => void };

export const Footer = memo(function ModalFooter(props: Props): JSX.Element {
  const { buttonText, onNextClick } = props;

  return (
    <Wrapper>
      <Link
        color="primary"
        textSize="xl"
        href="https://docs.gnosis.io/protocol/docs/intro-cmm/"
        as="button"
      >
        Read the docs
      </Link>
      <Button
        size="lg"
        color="primary"
        onClick={onNextClick}
        variant="contained"
      >
        {buttonText}
      </Button>
    </Wrapper>
  );
});
