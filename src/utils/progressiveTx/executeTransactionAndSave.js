import { getTransactions } from "api/tx";
import { saveTransactionCall } from "./saving";

const sleep = (ms) => new Promise((resolve) => setTimeout((resolve, ms)));

/**
 * Wrapper to await a transaction via the Safe
 *
 * @param {string} methodName
 * @param {string} to
 * @param {string} data
 */
const executeTransactionAndSave = async (
  sdk,
  methodName,
  { from, to, data, value = 0 }
) => {
  console.log(to, value, data);

  // Execute and await transaction via SDK
  await sdk.sendTransactions([
    {
      to,
      value,
      data,
    },
  ]);
  // Save TX Details before redirect (hopefully)
  await saveTransactionCall(methodName, from, to, data, value);
  console.log("saved!");
  /*
  await sleep(100);

  const allTransactions = await getTransactions(from);
  console.log(allTransactions);
  */
};

export default executeTransactionAndSave;
