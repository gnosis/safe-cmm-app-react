import React from "react";

import { Tabs, Props as TabsProps } from ".";
import { Meta } from "@storybook/react/types-6-0";

export default {
  component: Tabs,
  title: "navigation/tabs/Tabs",
} as Meta;

const Template = (args: TabsProps): JSX.Element => <Tabs {...args} />;

const ComponentPage1 = (): JSX.Element => <div>I&apos;m a test</div>;
const ComponentPage2 = (): JSX.Element => <div>I&apos;m also a test</div>;

export const Default = Template.bind({});
Default.args = {
  tabs: [
    {
      component: ComponentPage1,
      name: "page1",
      label: "First Page",
    },
    {
      component: ComponentPage2,
      name: "page2",
      label: "Second Page",
    },
  ],
};
