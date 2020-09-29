export type FormFields =
  | "baseTokenAddress"
  | "quoteTokenAddress"
  | "lowestPrice"
  | "startPrice"
  | "highestPrice"
  | "baseTokenAmount"
  | "quoteTokenAmount"
  | "totalBrackets"
  | "totalInvestment"
  | "calculatedBrackets";

export type DeployFormValues = Record<FormFields, string>;
