import { theme as srcTheme } from "@gnosis.pm/safe-react-components";

type themeType = typeof srcTheme;
type colorsType = typeof srcTheme.colors;
type textType = typeof srcTheme.text;

const newColors = {
  backgroundError: "#FFE6EA",
  backgroundWarning: "#FFF3E2",
  backgroundSideBar: "#F7F5F5",
  backgroundBadgeGray: "#e8e7e6",
  backgroundBadgeDarkGray: "#b2b5b2",

  // brackets view colors
  backgroundLightGreen: "rgba(0, 156, 180, 0.1)",
  backgroundLightPurple: "rgba(128, 94, 255, 0.1)",

  borderLightGreen: "rgba(0, 156, 180, 0.2)",
  borderDarkGreen: "#009cb4",
  borderLightPurple: "rgba(128, 94, 255, 0.2)",
  borderDarkPurple: "#805eff",

  // text
  textGrey: "#5D6D74",

  // roi/apy
  roiApyPositive: "#008D73",
  roiApyNegative: "#F42117",
};

const newTextSizes = {
  xs: {
    fontSize: "10px",
    lineHeight: "14px",
  },
  "2xl": {
    fontSize: "20px",
    lineHeight: "26px",
  },
  "3xl": {
    fontSize: "26px",
    lineHeight: "36px",
  },
};

export interface Theme extends themeType {
  colors: colorsType & typeof newColors;
  text: textType & { size: typeof newTextSizes };
}

export const theme: Theme = {
  ...srcTheme,
  colors: { ...srcTheme.colors, ...newColors },
  text: { ...srcTheme.text, size: { ...srcTheme.text.size, ...newTextSizes } },
};

export type ThemeTextSize = keyof typeof theme["text"]["size"];
export type ThemeLoaderSize = keyof typeof theme["loader"]["size"];
export type ThemeColors = keyof typeof theme["colors"];
