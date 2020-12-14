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
  | "baseTokenBrackets"
  | "quoteTokenBrackets"
  | "bracketsSizes";

export type DeployFormValues = Record<FormFields, string>;
