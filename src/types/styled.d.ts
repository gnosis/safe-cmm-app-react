import "styled-components";

import { Theme } from "theme";
// DefaultTheme from styled-components comes empty pre-configured
// extend it here for correct typings
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
