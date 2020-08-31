import React, { useState } from "react";
import { Meta } from "@storybook/react/types-6-0";

import { TotalBrackets, Props } from ".";

export default {
  component: TotalBrackets,
  title: "basic/input/TotalBrackets",
  excludeStories: /.*Data$/,
} as Meta;

export const totalBracketsData = { amount: "~ $5,234,623.44" };

const Template = (args: Props): JSX.Element => {
  const [value, setValue] = useState(args.value);

  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TotalBrackets
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...totalBracketsData };
