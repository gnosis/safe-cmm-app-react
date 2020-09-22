export type FormFields =
  | "baseTokenAddress"
  | "quoteTokenAddress"
  | "lowestPrice"
  | "startPrice"
  | "highestPrice"
  | "baseTokenAmount"
  | "quoteTokenAmount"
  | "totalBrackets"
  | "totalInvestment";

export type DeployFormValues = Record<FormFields, string>;
