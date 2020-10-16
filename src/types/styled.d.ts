import "styled-components";

// DefaultTheme from styled-components comes empty pre-configured
// extend it here for correct typings
declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      white: string;
      // TODO: Add the rest of the theme variables
    };
  }
}
