import React, { memo, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Box } from "@material-ui/core";

import { Button, Checkbox } from "@gnosis.pm/safe-react-components";

import storage from "api/storage";

import { theme } from "theme";

import { Text, Props as TextProps } from "components/basic/display/Text";
import { Steps } from "components/basic/display/Steps";

const BodyWrapper = styled(Box)`
  max-width: 480px;
`;

const FooterWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const SpanText = (props: Omit<TextProps, "as">) => (
  <Text as="span" {...props} />
);

const Emphasis = styled(SpanText)`
  text-decoration: underline;
  display: inline;
`;

const Header = styled(Text)`
  text-align: justify;
  padding: 16px 0;
`;

const Well = styled(Box)`
  background-color: ${({ theme }) => theme.colors.backgroundSideBar};
  margin: 0 -24px;

  padding: 16px 24px;
`;

const CheckboxRow = styled(Box)`
  padding-top: 16px;
  text-align: center;

  .MuiTypography-root.MuiFormControlLabel-label.MuiTypography-body1 {
    font-family: ${theme.fonts.fontFamily};
    font-size: ${theme.text.size.lg.fontSize};
    line-height: ${theme.text.size.lg.lineHeight};
  }
`;

interface ModalBodyProps {
  setConfirmHandler: (
    continueSubmit: () => Promise<any> | any
  ) => Promise<boolean> | boolean;
}

export const Body = memo(function WithdrawLiquidity({
  setConfirmHandler,
}: ModalBodyProps): JSX.Element {
  const [isChecked, setChecked] = useState(false);
  const handleRememberChangeToggle = useCallback(() => {
    setChecked((value) => !value);
  }, []);

  useEffect(() => {
    setConfirmHandler(async () => {
      await storage.setItem("withdrawFlowSkip", isChecked);
      return true;
    });
  }, [isChecked, setConfirmHandler]);

  const steps = [
    <SpanText key="step1" size="lg">
      Click on <strong>Withdraw liquidity</strong>. Then sign the transaction
      with all Safe owners and wait 5 minutes for a confirmation.
    </SpanText>,
    <SpanText key="step2" size="lg">
      After the withdraw transaction is confirmed find the, now deactivated
      strategy, under the <strong>Closed</strong> tab. Click to expand the
      strategy and then click on <strong>Claim All Balances</strong>.<br />
      <br />
      Sign the claim Transaction with all Safe owners. After the confirmation
      the balances are withdrawn to the Safe.
    </SpanText>,
  ];

  return (
    <BodyWrapper key="body">
      <Header size="lg">
        This action will remove all liquidity from your strategy and effectively{" "}
        <Emphasis size="lg">stop it</Emphasis>. Two actions and transactions are
        required:
      </Header>
      <Well>
        <Steps steps={steps} />
      </Well>
      <CheckboxRow>
        <Checkbox
          label="Don't show this modal next time"
          checked={isChecked}
          name="withdrawRemember"
          onChange={handleRememberChangeToggle}
        />
      </CheckboxRow>
    </BodyWrapper>
  );
});

export interface ModalFooterProps {
  triggerConfirm?: () => void;
  triggerReject?: () => void;
}

export const Footer = memo(function WithdrawLiquidityFooter({
  triggerConfirm,
  triggerReject,
}: ModalFooterProps): JSX.Element {
  return (
    <FooterWrapper key="footer">
      <Button color="primary" size="md" onClick={triggerReject}>
        Cancel
      </Button>
      <Button
        color="primary"
        variant="contained"
        size="md"
        onClick={triggerConfirm}
      >
        Withdraw Liquidity
      </Button>
    </FooterWrapper>
  );
});
