import React from "react";
import styled from "styled-components";

import PropTypes from "prop-types";

import HorizontalBox from "components/HorizontalBox";

import { Box } from "@material-ui/core";
import { Title } from "@gnosis.pm/safe-react-components";

const NavigationItems = styled(Box)`
  margin-left: auto;
`;

const Heading = ({ title, navigationItems }) => {
  return (
    <HorizontalBox>
      <Title size="sm">{title}</Title>
      <NavigationItems>{navigationItems}</NavigationItems>
    </HorizontalBox>
  );
};

Heading.propTypes = {
  title: PropTypes.string.isRequired,
  navigationItems: PropTypes.oneOf([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

Heading.defaultProps = {
  navigationIItems: null,
};

export default Heading;
