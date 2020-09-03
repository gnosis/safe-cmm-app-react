import React, { memo } from "react";
import MaterialUiTooltip, { TooltipProps } from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core";
import { theme } from "@gnosis.pm/safe-react-components";

export type Props = Omit<TooltipProps, "arrow">;

const StyledToolTip = withStyles(() => ({
  tooltip: {
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    fontSize: theme.text.size.lg.fontSize,
    lineHeight: theme.text.size.lg.lineHeight,
    fontFamily: theme.fonts.fontFamily,
    letterSpacing: 0,
    textAlign: "center",
    maxWidth: "200px",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "1px 2px 10px 0 rgba(40, 54, 61, 0.18)",
  },
  arrow: {
    color: theme.colors.white,
    width: "2em",
  },
  tooltipPlacementLeft: {
    margin: "0 14px",
  },
  tooltipPlacementRight: {
    margin: "0 14px",
  },
  tooltipPlacementTop: {
    margin: "14px 0",
  },
  tooltipPlacementBottom: {
    margin: "14px 0",
  },
}))(MaterialUiTooltip);

/**
 * Tooltip component applying the styles defined on [CMM design](https://projects.invisionapp.com/d/main/default/#/console/20213446/428757598/inspect)
 *
 * Other than the styles, it's still a vanilla [Material UI Tooltip](https://material-ui.com/api/tooltip/)
 */
const _Tooltip: React.FC<Props> = (props: Props): JSX.Element => {
  const { children, ...rest } = props;

  return (
    <StyledToolTip {...rest} arrow>
      <span>{children}</span>
    </StyledToolTip>
  );
};

export const Tooltip = memo(_Tooltip);
