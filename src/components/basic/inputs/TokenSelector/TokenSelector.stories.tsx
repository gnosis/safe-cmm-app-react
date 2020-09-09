import React, { useState, useCallback } from "react";
import BN from "bn.js";
import { Meta } from "@storybook/react/types-6-0";

import { tokenDetailsToSelectItem } from "utils/misc";
import { mockTokenDetails } from "mock/data";

import { TokenSelectorViewer, TokenSelectorViewerProps } from "./viewer";

export default {
  component: TokenSelectorViewer,
  title: "basic/input/TokenSelector",
  excludeStories: /.*(Data|mock.*)$/,
} as Meta;

export const tokenSelectorData = {
  items: Object.values(mockTokenDetails).map(tokenDetailsToSelectItem),
  label: "Pick Token A",
  tooltip: "You should pick a token",
  tokenBalance: null,
  isBalanceLoading: false,
} as TokenSelectorViewerProps;

const Template = (args: TokenSelectorViewerProps): JSX.Element => {
  const onSubmit = (e: React.FormEvent) => e.preventDefault();
  const [tokenDetails, setTokenDetails] = useState<typeof args.tokenDetails>(
    args.tokenDetails
  );
  const [tokenBalance, setTokenBalance] = useState<typeof args.tokenBalance>(
    args.tokenBalance
  );
  const [isBalanceLoading, setIsBalanceLoading] = useState(
    args.isBalanceLoading
  );

  const onChange = useCallback((tokenAddress: string): void => {
    setTokenDetails(mockTokenDetails[tokenAddress]);
    setIsBalanceLoading(true);

    // simulate balance loading
    setTimeout((): void => {
      setTokenBalance(new BN("10000000000000000000000"));
      setIsBalanceLoading(false);
    }, 500);
  }, []);

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TokenSelectorViewer
        {...args}
        onSelect={onChange}
        tokenDetails={tokenDetails}
        tokenBalance={tokenBalance}
        isBalanceLoading={isBalanceLoading}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...tokenSelectorData };

export const PreSelectedToken = Template.bind({});
PreSelectedToken.args = {
  ...Default.args,
  tokenDetails: mockTokenDetails["0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4"],
  tokenBalance: new BN("9012841290731940273194"),
};
