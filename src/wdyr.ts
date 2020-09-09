import React from "react";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  console.log(`WHY DID YOU RENDER???`, whyDidYouRender);
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
