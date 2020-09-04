import { theme as srcTheme } from "@gnosis.pm/safe-react-components";

type themeType = typeof srcTheme;
type colorsType = typeof srcTheme.colors;

const backgroundColors = {
  backgroundError: "#FFE6EA",
  backgroundWarning: "#FFF3E2",
  borderError: "#F1A09C",
};

export interface Theme extends themeType {
  colors: colorsType & typeof backgroundColors;
}

export const theme = {
  ...srcTheme,
  colors: { ...srcTheme.colors, ...backgroundColors },
};