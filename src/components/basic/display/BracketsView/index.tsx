import React, { memo } from "react";

import { BracketsViewView, Props as ViewerProps } from "./viewer";

export type Props = Omit<ViewerProps, "lowerThreshold" | "upperThreshold">;

export const BracketsViewer = memo(function BracketsViewer(
  props: Props
): JSX.Element {
  // TODO: add logic for fetching market price when type === 'strategy'

  return <BracketsViewView {...props} />;
});
