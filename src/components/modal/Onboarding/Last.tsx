import React, { memo } from "react";

import { Text } from "components/basic/display/Text";
import { Link } from "components/basic/inputs/Link";

export const Last = memo(function Last(): JSX.Element {
  return (
    <>
      <Text size="2xl" strong className="title">
        Support
      </Text>
      <Text size="lg" center>
        Read the tooltips to understand each parameter in detail, and don’t
        hesitate to contact us on{" "}
        <Link href="https://chat.gnosis.io/" textSize="lg" color="primary">
          Discord
        </Link>{" "}
        if you have any questions.
      </Text>
    </>
  );
});
