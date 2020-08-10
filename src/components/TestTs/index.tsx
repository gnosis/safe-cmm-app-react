import React from "react";
import { Point } from "./dummyTsFile";

interface Props {
  p: Point;
}

// TODO: remove this dummy component once a real TS file is added.
// Here only to make the build happy for now.

export const TestTs: React.FC<Props> = ({ p }) => {
  return (
    <div>
      Dummy point:
      <ul>
        <li>
          <strong>a</strong>: {p.a}
        </li>
        <li>
          <strong>b</strong>: {p.b}
        </li>
      </ul>
    </div>
  );
};
