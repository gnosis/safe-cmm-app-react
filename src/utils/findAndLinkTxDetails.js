import { getTransactions } from 'api/tx'

const findAndLinkTxDetails = async (safeOwner, methodName) => {
  const allTransactions = await getTransactions(safeOwner)
}


export default findAndLinkTxDetails;