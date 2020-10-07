import React, { memo } from "react";
import styled from "styled-components";

const HiddenBox = styled.div`
  color: white;
  position: absolute;
  bottom: 0;
  right: 0;
`;

export const Version = memo(function Version(): JSX.Element {
  const isDeployed = process.env.CONTINUOUS_INTEGRATION === "true";
  const deployBranch = process.env.TRAVIS_BRANCH || "unknown branch";
  const buildId = process.env.TRAVIS_BUILD_ID || "unknown build";
  const commit = process.env.TRAVIS_COMMIT || "unknown commit";

  if (!isDeployed) {
    return <HiddenBox>webpack dev version - no version info</HiddenBox>;
  }

  return (
    <HiddenBox>
      deployed branch&nbsp;
      {deployBranch} -&nbsp;
      {buildId} -&nbsp;
      {commit}
    </HiddenBox>
  );
});
