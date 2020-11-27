import React, { useState } from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { Welcome, Props } from ".";

export default {
  component: Welcome,
  title: "modal/Welcome",
} as Meta;

const Template: Story = ({
  expanded,
  initialStep,
}: Props & { expanded?: boolean }) => {
  const [isOpen, setIsOpen] = useState(expanded);
  return (
    <div>
      <button onClick={() => setIsOpen((open) => !open)}>toggle modal</button>
      {isOpen && (
        <Welcome
          closeModal={() => setIsOpen(false)}
          initialStep={initialStep}
        />
      )}
    </div>
  );
};

export const Default = Template.bind({});

export const Step1 = Template.bind({});
Step1.args = { expanded: true };

export const Step2 = Template.bind({});
Step2.args = { expanded: true, initialStep: 2 };

export const Step3 = Template.bind({});
Step3.args = { expanded: true, initialStep: 3 };

export const Step4 = Template.bind({});
Step4.args = { expanded: true, initialStep: 4 };
