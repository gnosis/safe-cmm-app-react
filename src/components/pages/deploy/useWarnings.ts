import { useEffect, useMemo } from "react";
import { useForm } from "react-final-form";
import { capitalize } from "lodash";

import {
  FUNDING_PER_BRACKET_WARNING_THRESHOLD,
  START_PRICE_WARNING_THRESHOLD_PERCENTAGE,
} from "utils/constants";

import { ValidationError, ValidationErrors } from "validators/types";

import { DeployFormValues } from "./types";
import { useFundingOutOfThreshold } from "./useFundingOutOfThreshold";
import { useIsStartPriceOutOfThreshold } from "./useStartPriceOutOfThreshold";

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

function buildPriceWarning(type: "lowest" | "highest"): ValidationError {
  const isLowest = type === "lowest";

  return {
    label: "Strategy with only one token funded",
    children: `Your specified ${capitalize(type)} Price is close to or ${
      isLowest ? "above" : "below"
    } your Start Price. This will create a strategy where only funding can be provided for the ${capitalize(
      type
    )} Price (Token ${isLowest ? "A" : "B"}).`,
  };
}

/**
 * Hook that goes through form values and returns warnings, if any.
 * It also sets fields `warn` flag.
 *
 * Must be used within the Form context
 *
 * @param values Form values
 */
export function useWarnings(values: DeployFormValues): ValidationErrors {
  const {
    mutators: { setFieldData },
  } = useForm();

  const {
    baseTokenAddress,
    quoteTokenAddress,
    startPrice,
    baseTokenAmount,
    quoteTokenAmount,
    baseTokenBrackets,
    quoteTokenBrackets,
  } = values;

  const baseBrackets = baseTokenBrackets && +baseTokenBrackets;
  const quoteBrackets = quoteTokenBrackets && +quoteTokenBrackets;

  const startPriceOutOfThreshold = useIsStartPriceOutOfThreshold({
    baseTokenAddress,
    quoteTokenAddress,
    startPrice,
    threshold: START_PRICE_WARNING_THRESHOLD_PERCENTAGE,
  });
  const startPriceHasWarning =
    startPriceOutOfThreshold > 0 || startPriceOutOfThreshold < 0;

  const totalBracketsHasWarning = +values.totalBrackets === 1;

  const baseTokenAmountHasWarning = useFundingOutOfThreshold({
    fundingAmount: baseTokenAmount,
    brackets: baseBrackets,
    tokenAddress: baseTokenAddress,
    threshold: FUNDING_PER_BRACKET_WARNING_THRESHOLD,
  });
  const quoteTokenAmountHasWarning = useFundingOutOfThreshold({
    fundingAmount: quoteTokenAmount,
    brackets: quoteBrackets,
    tokenAddress: quoteTokenAddress,
    threshold: FUNDING_PER_BRACKET_WARNING_THRESHOLD,
  });

  const lowestPriceHasWarning = quoteBrackets === 0 && baseBrackets !== 0;
  const highestPriceHasWarning = baseBrackets === 0 && quoteBrackets !== 0;

  // Split warnings into two parts, because we can't access field data state on the form

  // 1. This part tells the field it has a warning
  useEffect(() => {
    setFieldData("totalBrackets", { warn: totalBracketsHasWarning });
    setFieldData("baseTokenAmount", { warn: baseTokenAmountHasWarning });
    setFieldData("quoteTokenAmount", { warn: quoteTokenAmountHasWarning });
    setFieldData("startPrice", { warn: startPriceHasWarning });
    setFieldData("lowestPrice", { warn: lowestPriceHasWarning });
    setFieldData("highestPrice", { warn: highestPriceHasWarning });
  }, [
    baseTokenAmountHasWarning,
    highestPriceHasWarning,
    lowestPriceHasWarning,
    quoteTokenAmountHasWarning,
    setFieldData,
    startPriceHasWarning,
    totalBracketsHasWarning,
  ]);

  // 2. This part aggregates all the warning messages to display them at the end of the form.
  const warnings = useMemo(
    () => ({
      totalBrackets: totalBracketsHasWarning && TOTAL_BRACKETS_WARNING,
      tokenAmount:
        (baseTokenAmountHasWarning || quoteTokenAmountHasWarning) &&
        TOKEN_AMOUNT_WARNING,
      startPrice:
        startPriceHasWarning &&
        buildStartPriceWarning(startPriceOutOfThreshold),
      lowestPrice: lowestPriceHasWarning && buildPriceWarning("lowest"),
      highestPrice: highestPriceHasWarning && buildPriceWarning("highest"),
    }),
    [
      baseTokenAmountHasWarning,
      highestPriceHasWarning,
      lowestPriceHasWarning,
      quoteTokenAmountHasWarning,
      startPriceHasWarning,
      startPriceOutOfThreshold,
      totalBracketsHasWarning,
    ]
  );

  return warnings;
}
