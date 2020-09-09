import React, { useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { Box, Divider } from "@material-ui/core";
import { ButtonLink } from "@gnosis.pm/safe-react-components";

import TextWithBadge from "./TextWithBadge";

const NavBarContainer = styled(Box)`
  display: flex;
  width: auto;
  height: 22px;
  margin: 12px 0;
`;

const NavButtonItem = styled(Box)`
  display: flex;
`;

const NavButton = styled(ButtonLink)`
  text-decoration: none;

  p {
    text-decoration: none;
    color: ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.placeHolder};
    font-weight: ${({ active }) => (active ? "600" : "400")};
  }

  :hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  :active {
    font-weight: bold;
  }

  .active {
    font-weight: bold;
  }
`;

const NavDivider = styled(Divider)`
  height: 10px;
`;

const NavBar = ({ items, onChange, selectedItem }) => {
  const handleSelectTab = useCallback(
    (id, e) => {
      e.preventDefault();
      onChange(id);
    },
    [onChange]
  );

  const makeTabSelector = useCallback((id) => (e) => handleSelectTab(id, e), [
    handleSelectTab,
  ]);

  return (
    <NavBarContainer>
      {items.map(({ id, label, counter }, index) => (
        <NavButtonItem key={id}>
          <NavButton
            key={id}
            onClick={makeTabSelector(id)}
            active={selectedItem === id}
            textSize="xl"
          >
            <TextWithBadge
              active={selectedItem === id}
              badgeContent={counter || 0}
            >
              {label}
            </TextWithBadge>
          </NavButton>
          {index !== items.length - 1 && <NavDivider orientation="vertical" />}
        </NavButtonItem>
      ))}
    </NavBarContainer>
  );
};

NavBar.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func.isRequired,
  selectedItem: PropTypes.string,
};

NavBar.defaultProps = {
  items: [],
  selectedItem: null,
};

export default NavBar;
