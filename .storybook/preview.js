import "../src/wdyr";
import React from "react";
import { addDecorator } from "@storybook/react";
import { addParameters } from "@storybook/react";
import { ThemeProvider } from "styled-components";
import { theme } from "theme";

import GlobalStyles from "../src/components/GlobalStyle";

addDecorator((storyFn) => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    {storyFn()}
  </ThemeProvider>
));

addParameters({
  options: {
    showRoots: false,
  },
  controls: { expanded: true },
});
