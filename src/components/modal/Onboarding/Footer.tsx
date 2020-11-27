import { Button } from "@gnosis.pm/safe-react-components";
import { Link } from "components/basic/inputs/Link";
import React, { memo } from "react";
import styled from "styled-components";

const Wrapper = styled.div``;

export type Props = { buttonText: string; onNextClick: () => void };

export const Footer = memo(function ModalFooter(props: Props): JSX.Element {
  const { buttonText, onNextClick } = props;

  return (
    <Wrapper>
      <Link color="primary">Read the docs</Link>
      <Button size="lg" color="primary" onClick={onNextClick}>
        {buttonText}
      </Button>
    </Wrapper>
  );
});
