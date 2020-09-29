import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import { Backdrop, withStyles } from "@material-ui/core";
import styled from "styled-components";

import { Loader } from "@gnosis.pm/safe-react-components";

import { SideBar } from "./SideBar";
import { TokenSelectorsFragment } from "./TokenSelectorsFragment";
import { PricesFragment } from "./PricesFragment";
import { MarketPriceFragment } from "./MarketPriceFragment";
import { ErrorMessagesFragment } from "./ErrorMessagesFragment";
import { DeployStrategyButtonFragment } from "./DeployStrategyButtonFragment";
import { isSubmittingAtom } from "./atoms";
import { DeployForm } from "./DeployForm";

const PageLayout = styled.div`
  display: flex;
  min-width: 860px;
`;

const DeployWidget = styled.div`
  // basic dimensions
  max-width: 444px;
  min-height: 482px;

  padding: 16px 13px;

  // Some space for sidebar
  margin-right: 48px;

  // Spacing between elements
  & > *:not(:last-child) {
    margin-bottom: 16px;
  }

  // fancy border
  border-radius: 16px;
  box-shadow: 0 20px 24px 0 rgba(0, 20, 40, 0.05),
    0 0 10px 0 rgba(0, 20, 40, 0.08);

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledBackdrop = withStyles(() => ({ root: { zIndex: 999 } }))(Backdrop);

export interface Props {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

function component(props: Props): JSX.Element {
  const { onSubmit } = props;
  const isSubmitting = useRecoilValue(isSubmittingAtom);

  return (
    <PageLayout>
      <DeployForm>
        <DeployWidget>
          <TokenSelectorsFragment />
          <MarketPriceFragment />
          <PricesFragment />
          <ErrorMessagesFragment />
          <DeployStrategyButtonFragment />
        </DeployWidget>
      </DeployForm>
      <SideBar />
      <StyledBackdrop open={isSubmitting}>
        <Loader size="lg" color="primaryLight" />
      </StyledBackdrop>
    </PageLayout>
  );
}

export const DeployPageViewer: typeof component = memo(component);
