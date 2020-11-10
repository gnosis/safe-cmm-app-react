import React, { memo, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { FormApi, FormState } from "final-form";
import { FormSpy } from "react-final-form";

import { setFieldData } from "utils/finalForm";

import { warningsAtom } from "./atoms";
import { DeployFormValues } from "./types";

export type Props = { mutators: { setFieldData: typeof setFieldData } };

const TOTAL_BRACKETS_WARNING = {
  label: "Strategy with only one bracket",
  children:
    "You specified a total brackets count of 1. This will create a strategy which will only use a single bracket for a single token.",
};

const TOKEN_AMOUNT_WARNING = {
  label: "The minimum viable funding for each bracket is 5K USD.",
};

const START_PRICE_WARNING = {
  label: "Detected: Start price >2% higher than market price",
  children:
    "The specified Start Price is at least 2% higher than the current indicated market price. If intentional continue with your strategy.",
};

export const Warnings = memo(function Warnings({
  mutators: { setFieldData },
}: Pick<FormApi, "mutators">): JSX.Element {
  const setWarnings = useSetRecoilState(warningsAtom);

  const handleWarnings = useCallback(
    ({ values }: FormState<DeployFormValues>) => {
      const totalBracketsHasWarning = +values.totalBrackets === 1;
      // TODO: implement
      const baseTokenAmountHasWarning = false;
      const quoteTokenAmountHasWarning = false;
      const startPriceHasWarning = false;

      // Split warnings into two parts, because we can't access field data state on the form

      // This part tells the field it has a warning
      setFieldData("totalBrackets", { warn: totalBracketsHasWarning });
      setFieldData("baseTokenAmount", { warn: baseTokenAmountHasWarning });
      setFieldData("quoteTokenAmount", { warn: quoteTokenAmountHasWarning });
      setFieldData("startPrice", { warn: startPriceHasWarning });

      // This part aggregates all the warning messages to display them at the end of the form.
      // Since we can't easily access the field `data` state, we are using an external source
      setWarnings((warnings) => ({
        ...warnings,
        totalBrackets: totalBracketsHasWarning && TOTAL_BRACKETS_WARNING,
        tokenAmount:
          (baseTokenAmountHasWarning || quoteTokenAmountHasWarning) &&
          TOKEN_AMOUNT_WARNING,
        startPrice: startPriceHasWarning && START_PRICE_WARNING,
      }));
    },
    [setFieldData, setWarnings]
  );

  return <FormSpy subscription={{ values: true }} onChange={handleWarnings} />;
});
