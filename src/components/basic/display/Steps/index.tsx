import { Box, Typography } from "@material-ui/core";
import React, { memo } from "react";
import styled from "styled-components";

export interface Props {
  steps: React.ReactNode[];
}

const RowWithNumBadge = styled(Box)`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  padding: 12px 0;
`;

const NumBadge = styled(Typography)`
  border-radius: 100%;
  display: block;
  min-width: 50px;
  width: 50px;
  height: 50px;
  line-height: 50px !important;
  text-align: center;
  font-size: 24px !important;
  font-weight: bold !important;

  background-color: ${({ theme }) => theme.colors.backgroundBadgeGray};
  position: relative;

  &:not(.last) {
    &::after {
      content: "";
      display: block;
      position: absolute;
      // comes from parent padding
      left: 24px;
      width: 2px;
      border-radius: 2px;

      top: calc(100% + 5px);

      // height of relative parent element - badge height
      height: calc(100% - 13px);

      background-color: ${({ theme }) => theme.colors.backgroundBadgeDarkGray};
    }
  }
`;

const RowContent = styled(Box)`
  padding: 0 24px;
`;

export const Steps = memo(function Steps({ steps }: Props): JSX.Element {
  return (
    <Box>
      {steps.map((stepElement, index) => (
        <RowWithNumBadge key={`step-${index}`}>
          <NumBadge className={index === steps.length - 1 ? "last" : ""}>
            {index + 1}
          </NumBadge>
          <RowContent>{stepElement}</RowContent>
        </RowWithNumBadge>
      ))}
    </Box>
  );
});
