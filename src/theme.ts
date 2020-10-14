import { theme as srcTheme } from "@gnosis.pm/safe-react-components";

type themeType = typeof srcTheme;
type colorsType = typeof srcTheme.colors;
type textType = typeof srcTheme.text;

const backgroundColors = {
  backgroundError: "#FFE6EA",
  backgroundWarning: "#FFF3E2",
  backgroundSideBar: "#F7F5F5",
};

const xsTextSize = {
  xs: {
    fontSize: "10px",
    lineHeight: "14px",
  },
};

export interface Theme extends themeType {
  colors: colorsType & typeof backgroundColors;
  text: textType & { size: typeof xsTextSize };
}

export const theme: Theme = {
  ...srcTheme,
  colors: { ...srcTheme.colors, ...backgroundColors },
  text: { ...srcTheme.text, size: { ...srcTheme.text.size, ...xsTextSize } },
};

export type ThemeTextSize = keyof typeof theme["text"]["size"];
export type ThemeColors = keyof typeof theme["colors"];
