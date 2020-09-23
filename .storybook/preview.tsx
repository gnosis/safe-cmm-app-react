import "../src/wdyr";
import React from "react";
import { addDecorator } from "@storybook/react";
import { addParameters } from "@storybook/react";
import { ThemeProvider } from "styled-components";
import { theme } from "../src/theme";

import GlobalStyles from "../src/components/GlobalStyle";

import { mockHookDecorator } from "../src/mock/mockHookContext";
import { injectRecoilStateDecorator } from "../src/mock/injectRecoilState";

addDecorator((storyFn) => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    {storyFn()}
  </ThemeProvider>
));

addDecorator(mockHookDecorator);
addDecorator(injectRecoilStateDecorator);

addParameters({
  options: {
    showRoots: false,
  },
  controls: { expanded: true },
});
