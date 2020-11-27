import React, { memo } from "react";
import styled from "styled-components";
import { Text, Icon } from "@gnosis.pm/safe-react-components";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  withStyles,
} from "@material-ui/core";

import { theme } from "theme";

import { Link } from "components/basic/inputs/Link";

import howItWorks from "./howItWorks.json";

const Wrapper = styled.div`
  width: 340px;
  height: 140px;
  border-radius: 6px;
  background-color: ${theme.colors.backgroundSideBar};

  & > div:first-child {
    padding: 15px 16px;

    & > :first-child {
      margin-bottom: 10px;
    }
  }

  display: flex;
  flex-direction: column;

  // 'How it works' list.
  // TODO: Maybe move this out?
  ol {
    padding: 0;
    list-style: none;
    counter-reset: sidebar-counter;
    font-family: ${theme.fonts.fontFamily};
    font-size: ${theme.text.size.lg.fontSize};
    line-height: ${theme.text.size.lg.lineHeight};
    color: ${theme.colors.text};

    li {
      counter-increment: sidebar-counter;

      &:not(:last-child) {
        margin-bottom: 5px;
      }

      &::before {
        content: counter(sidebar-counter) ".";
        font-weight: bolder;
        padding-right: 0.5em;
      }
    }
  }
`;

const StyledAccordion = withStyles({
  root: {
    // Remove borders
    border: "none",
    boxShadow: "none",
    // Remove separator
    "&:before": {
      display: "none",
    },
    // Fix Summary height, no moving around
    margin: "0",
    "&$expanded": {
      margin: "0",
    },
  },
  expanded: {},
})(Accordion);

const StyledAccordionSummary = withStyles({
  root: {
    backgroundColor: theme.colors.backgroundBadgeGray,
    border: "none",
    minHeight: "46px",
    // Also preventing Summary from expanding
    "&$expanded": {
      minHeight: "46px",
    },
  },
  // And this one also preventing Summary from expanding
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  // As well as this
  expanded: {},
})(AccordionSummary);

const StyledAccordionDetails = withStyles({
  root: {
    backgroundColor: theme.colors.backgroundSideBar,
  },
})(AccordionDetails);

export const SideBar = memo(function SideBar(): JSX.Element {
  return (
    <Wrapper>
      <div>
        <Text size="xl" strong>
          Support
        </Text>

        <Text size="lg" as="span">
          👉 Check out the{" "}
          <Link
            textSize="lg"
            color="primary"
            href="https://docs.gnosis.io/protocol/docs/intro-cmm/"
          >
            GP CMM intro article
          </Link>
        </Text>

        <Text size="lg">
          👉{" "}
          <Link textSize="lg" color="primary" href="https://chat.gnosis.io/ ">
            Join Discord
          </Link>
        </Text>
      </div>
      <StyledAccordion square>
        <StyledAccordionSummary
          expandIcon={<Icon type="circleDropdown" size="md" />}
        >
          <Text size="xl" strong>
            How it works
          </Text>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <ol>
            {howItWorks.map((item: string, id: number) => (
              <li key={id}>{item}</li>
            ))}
          </ol>
        </StyledAccordionDetails>
      </StyledAccordion>
    </Wrapper>
  );
});
