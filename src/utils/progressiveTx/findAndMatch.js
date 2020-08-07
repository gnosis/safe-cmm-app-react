import { get } from "lodash";
import { getTransactions } from "api/tx";
import { getTxsForMethod, txDateTimeSort } from "./saving";

const findAndMatch = async (method, from) => {
  const safeTransactions = await getTransactions(from);

  const savedTransactions = getTxsForMethod(method, from);

  savedTransactions.sort(txDateTimeSort);

  console.log(savedTransactions, safeTransactions);

  let matchingTx;
  let newestTimeDiff = Infinity;
  savedTransactions.forEach((txDetails, txDetailIndex) => {
    safeTransactions.forEach((safeTxDetails, safeTxDetailIndex) => {
      const decodedData = get(
        safeTxDetails,
        "dataDecoded.parameters[0].decodedValue[0]",
        {}
      );

      // todo: check with data
      if (
        decodedData &&
        Object.keys(decodedData).length > 0 &&
        safeTxDetails.safe === from &&
        decodedData.to.toLowerCase() === txDetails.to.toLowerCase() &&
        decodedData.data.toLowerCase() === txDetails.data.toLowerCase() &&
        safeTxDetails.value.toString() === txDetails.value.toString()
      ) {
        const safeTxCreatedOn = new Date(safeTxDetails.submissionDate);

        const timeCreatedOnDiff = Math.abs(safeTxCreatedOn - txDetails.created);
        /*
        console.log(
          `Time difference between safe @${safeTxDetailIndex} and saved tx @${txDetailIndex} is ${(
            timeCreatedOnDiff / 1000
          ).toFixed(0)}s`
        );
        */

        if (timeCreatedOnDiff < 10 * 60 * 1000) {
          if (timeCreatedOnDiff < newestTimeDiff) {
            console.log(
              `found one that matched earlier: @${safeTxDetailIndex} to tx @${txDetailIndex}`
            );
            // find newest one
            matchingTx = safeTxDetails;
            newestTimeDiff = timeCreatedOnDiff;
          }
        }
      }
    });
  });

  return matchingTx;
};

export default findAndMatch;
