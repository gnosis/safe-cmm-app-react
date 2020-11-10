import React, { memo } from "react";

import { BracketsViewView, Props as ViewerProps } from "./viewer";

export type Props = ViewerProps;

export const BracketsViewer = memo(function BracketsViewer(
  props: Props
): JSX.Element {
  // TODO: With the logic for strategy display moved up, we might not need this extra step at all
  return <BracketsViewView {...props} />;
});
