import React, { memo, useMemo } from "react";
import styled from "styled-components";
import { Icon } from "@gnosis.pm/safe-react-components";

import { Text } from "components/basic/display/Text";

import { theme } from "theme";

type TypeStrings = "error" | "warning";

export interface Props {
  type: TypeStrings;
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

export const Message = memo(function Message(props: Props): JSX.Element {
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
});
