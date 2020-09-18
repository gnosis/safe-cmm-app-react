import React from "react";
import { BaseDecorators } from "@storybook/addons";
import { MutableSnapshot, RecoilRoot } from "recoil";

/**
 * Allows Recoil states to be initialized with a default value
 * Takes in a list of tuples of type: [RecoilState<T>, T]
 *
 * in *.stories.tsx
 * Story.parameters ={
 *  recoilStates: [
 *    [atom, defaultValue]
 *  ]
 * }
 */
export const injectRecoilStateDecorator: BaseDecorators<JSX.Element>[0] = (
  Story,
  { parameters }
) => {
  const { recoilStates } = parameters;

  const initializeState = ({ set }: MutableSnapshot): void => {
    recoilStates?.map(([atom, state]) => set(atom, state));
  };
  return <RecoilRoot initializeState={initializeState}>{Story()}</RecoilRoot>;
};
