import React, { memo, useMemo } from "react";
import styled from "styled-components";
import { Icon, Text } from "@gnosis.pm/safe-react-components";

import { theme } from "theme";

export interface Props {
  type: "error" | "warning";
  label: string;
  children: React.ReactNode;
}

const Wrapper = styled.div<Props>`
  display: flex;
  flex-direction: column;

  padding: 14px 15px 12px;

  background-color: ${({ type }): string =>
    theme.colors[`background${type[0].toUpperCase()}${type.slice(1)}`]};

  border-radius: 6px;

  & > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    svg {
      padding-right: 0.25em;
    }
  }

  .msgBody {
    padding-top: 12px;
  }
`;

const component: React.FC<Props> = (props) => {
  const { type, label, children } = props;

  const msgBody = useMemo((): React.ReactNode => {
    if (!children) {
      return children;
    } else if (typeof children === "string") {
      return (
        <Text size="md" color="shadow" className="msgBody">
          {children}
        </Text>
      );
    } else {
      return <div className="msgBody">{children}</div>;
    }
  }, [children]);

  return (
    <Wrapper {...props}>
      <div>
        <Icon
          size="sm"
          type={type === "warning" ? "alert" : "error"}
          color={type}
        />
        <Text size="lg" strong>
          {label}
        </Text>
      </div>
      {msgBody}
    </Wrapper>
  );
};

export const Message = memo(component);
