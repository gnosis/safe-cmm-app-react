import React, { memo } from "react";
import styled from "styled-components";

const HiddenBox = styled.div`
  color: white;
  position: fixed;
  top: 0;
  right: 0;
`;

export const Version = memo(function Version(): JSX.Element {
  const isDeployed = process.env.CONTINUOUS_INTEGRATION === "true";
  const deployBranch = process.env.TRAVIS_BRANCH;
  const buildId = process.env.TRAVIS_BUILD_ID;
  const commit = process.env.TRAVIS_COMMIT;

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
