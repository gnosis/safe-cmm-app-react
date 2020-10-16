import React, { memo } from "react";
import styled from "styled-components";

import { Strategies } from "./Strategies";

const PageLayout = styled.div`
  display: flex;
`;

export const StrategiesPageViewer = memo(
  function StrategiesPageViewer(): JSX.Element {
    return (
      <PageLayout>
        <Strategies />
      </PageLayout>
    );
  }
);
