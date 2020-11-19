import React, { memo, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useForm, useFormState } from "react-final-form";
import Decimal from "decimal.js";

import { setFieldData } from "utils/finalForm";
import {
  ONE_HUNDRED_DECIMAL,
  START_PRICE_WARNING_THRESHOLD_PERCENTAGE,
} from "utils/constants";

import { useGetPrice } from "hooks/useGetPrice";
import { useTokenDetails } from "hooks/useTokenDetails";

import { ValidationError } from "validators/types";

import { warningsAtom } from "./atoms";
import { DeployFormValues } from "./types";

const TOTAL_BRACKETS_WARNING = {
  label: "Strategy with only one bracket",
  children:
    "You specified a total brackets count of 1. This will create a strategy which will only use a single bracket for a single token.",
};

const TOKEN_AMOUNT_WARNING = {
  label: "The minimum viable funding for each bracket is 5K USD.",
};

function buildStartPriceWarning(threshold?: number): ValidationError {
  if (!threshold) {
    return false;
  }
  const direction = threshold > 0 ? "higher" : "lower";
  const label = `Detected: Start price >2% ${direction} than market price`;
  const children = `The specified Start Price is at least 2% ${direction} than the current indicated market price. If intentional continue with your strategy.`;
  return { label, children };
}

type UseIsStartPriceOutOfThresholdParams = {
  startPrice?: string;
  threshold: number;
  baseTokenAddress?: string;
  quoteTokenAddress?: string;
};

/**
 * Checks whether given `startPrice` is out of given `threshold` by comparing with market price.
 * Returns undefined on invalid input.
 * Returns 0 when `startPrice` is within threshold.
 * Returns +1 when `startPrice` is above threshold.
 * Returns -1 when `startPrice` is below threshold.
 */
function useIsStartPriceOutOfThreshold(
  params: UseIsStartPriceOutOfThresholdParams
): number | undefined {
  const { baseTokenAddress, quoteTokenAddress, startPrice, threshold } = params;

  // Avoid additional queries if `startPrice` is not set
  const baseToken = useTokenDetails(startPrice ? baseTokenAddress : undefined);
  const quoteToken = useTokenDetails(
    startPrice ? quoteTokenAddress : undefined
  );

  const { price } = useGetPrice({ baseToken, quoteToken });

  if (!startPrice || isNaN(+startPrice) || !price) {
    return undefined;
  }

  const startPriceDecimal = new Decimal(startPrice);

  const priceDifferencePercentage = startPriceDecimal
    .minus(price)
    .div(price)
    .mul(ONE_HUNDRED_DECIMAL);

  const thresholdDecimal = new Decimal(threshold);

  // negative threshold --- zero ----- positive threshold
  // ########|----------------|----------------|#########
  //    -1   |                0                |   +1
  return priceDifferencePercentage.gt(thresholdDecimal)
    ? 1
    : !priceDifferencePercentage.gte(thresholdDecimal.negated())
    ? -1
    : 0;
}

export type Props = {
  mutators: { setFieldData: typeof setFieldData };
  values: DeployFormValues;
};

export const Warnings = memo(function Warnings(): JSX.Element {
  const setWarnings = useSetRecoilState(warningsAtom);
  const { values } = useFormState({ subscription: { values: true } });
  const {
    mutators: { setFieldData },
  } = useForm();

  const { baseTokenAddress, quoteTokenAddress, startPrice } = values;

  const startPriceOutOfThreshold = useIsStartPriceOutOfThreshold({
    baseTokenAddress,
    quoteTokenAddress,
    startPrice,
    threshold: START_PRICE_WARNING_THRESHOLD_PERCENTAGE,
  });

  const totalBracketsHasWarning = +values.totalBrackets === 1;
  // TODO: implement
  const baseTokenAmountHasWarning = false;
  const quoteTokenAmountHasWarning = false;
  const startPriceHasWarning =
    startPriceOutOfThreshold > 0 || startPriceOutOfThreshold < 0;

  // Split warnings into two parts, because we can't access field data state on the form

  // 1. This part tells the field it has a warning
  useEffect(() => {
    setFieldData("totalBrackets", { warn: totalBracketsHasWarning });
    setFieldData("baseTokenAmount", { warn: baseTokenAmountHasWarning });
    setFieldData("quoteTokenAmount", { warn: quoteTokenAmountHasWarning });
    setFieldData("startPrice", { warn: startPriceHasWarning });

    // 2. This part aggregates all the warning messages to display them at the end of the form.
    // Since we can't easily access the field `data` state, we are using an external source
    setWarnings((warnings) => ({
      ...warnings,
      totalBrackets: totalBracketsHasWarning && TOTAL_BRACKETS_WARNING,
      tokenAmount:
        (baseTokenAmountHasWarning || quoteTokenAmountHasWarning) &&
        TOKEN_AMOUNT_WARNING,
      startPrice:
        startPriceHasWarning &&
        buildStartPriceWarning(startPriceOutOfThreshold),
    }));
  }, [baseTokenAmountHasWarning, quoteTokenAmountHasWarning, setFieldData, setWarnings, startPriceHasWarning, startPriceOutOfThreshold, totalBracketsHasWarning]);

  // Nothing to render here, we just wanna update the form state.
  // TODO: maybe this should be moved to <ErrorMessagesFragment/>?
  return <></>;
});
