import React from "react";

import PropTypes from "prop-types";
import styled from "styled-components";

import { Box } from "@material-ui/core";

// TODO: Add active badge background color to theme
const Badge = styled(Box)`
  display: inline-block;
  width: 24px;
  text-align: center;
  position: relative;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : "#f2f2f2"};
  color: ${({ theme, active }) => (active ? theme.colors.white : "inherit")};
  border-radius: 4px;
`;

const TextWithBadge = ({ badgeContent, children, active }) => {
  return (
    <span>
      {children}&nbsp;
      <Badge active={active}>{badgeContent}</Badge>
    </span>
  );
};
TextWithBadge.propTypes = {
  badgeContent: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
};

TextWithBadge.defaultProps = {
  active: false,
};

export default TextWithBadge;
