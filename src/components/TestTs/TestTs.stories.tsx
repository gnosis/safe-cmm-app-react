import React from "react";

import { TestTs } from ".";

export default {
  component: TestTs,
  title: "Test TS",
  excludeStories: /.*Data$/,
};

export const testData = {
  p: { a: 0, b: 0 },
};

export const Default = () => <TestTs {...testData} />;
