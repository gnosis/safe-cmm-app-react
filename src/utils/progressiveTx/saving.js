import { get, set } from "lodash";

const localStorage = window.localStorage;

export const dateTimeSorter = (a, b) => {
  if (a === b) {
    return 0;
  }

  return a > b ? -1 : 1;
};

export const txDateTimeSort = (a, b) => {
  if (a.createdOn === b.createdOn) {
    return 0;
  }

  return a.createdOn > b.createdOn ? -1 : 1;
}

export const saveTransactionCall = (methodName, from, to, data, value) => {
  const prevTx = JSON.parse(localStorage.getItem("tx-progress") || "{}");

  const newQueue = {
    ...prevTx,
    userTxProgress: {
      ...get(prevTx, "userTxProgress", {}),
      [from]: {
        transactions: {
          ...get(prevTx, `userTxProgress[${from}].transactions`, {}),
          [methodName]: [
            ...get(
              prevTx,
              `userTxProgress[${from}].transactions[${methodName}]`,
              []
            ),
            {
              created: +new Date(),
              from,
              to,
              data,
              value,
            },
          ],
        },
      },
    },
  };

  localStorage.setItem("tx-progress", JSON.stringify(newQueue));
};

export const findLatestTxForMethod = (methodName, from) => {
  const txProgress = JSON.parse(localStorage.getItem("tx-progress") || "{}");

  const transactionsForMethodAndAccount = get(
    txProgress,
    `userTxProgress[${from}].transactions[${methodName}]`
  );

  if (!transactionsForMethodAndAccount) {
    return null;
  }

  transactionsForMethodAndAccount.sort(dateTimeSorter);
  return transactionsForMethodAndAccount[0]; // get newest
};

export const getTxsForMethod = (methodName, from) => {
  const txProgress = JSON.parse(localStorage.getItem("tx-progress") || "{}");

  const transactionsForMethodAndAccount = get(
    txProgress,
    `userTxProgress[${from}].transactions[${methodName}]`,
    []
  );

  transactionsForMethodAndAccount.sort(txDateTimeSort);
  return transactionsForMethodAndAccount;
}

export const cleanPrevTxForMethod = (methodName, from) => {
  const txProgress = JSON.parse(localStorage.getItem("tx-progress") || "{}");

  const txProgressNew = set(
    txProgress,
    `userTxProgress[${from}].transactions[${methodName}]`,
    []
  );
  localStorage.setItem("tx-progress", JSON.stringify(txProgressNew));
};

export const cleanUnmatchedTxForMethod = async (methodName, from) => {
  // todo
}