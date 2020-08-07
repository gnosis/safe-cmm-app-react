import web3 from 'web3'
const { toBN } = web3.utils;

const orderAndFund = async (
  { sdk, web3: instance },
  multiSend,
  owner,
  masterSafeContract,
  exchange,
  brackets,
  tokenBaseContract,
  tokenQuoteContract,
  limitLowest,
  limitHighest,
  //currentprice,
  depositBase,
  depositQuote
) => {
  const stepSizeMultiplier = Math.pow(
    limitHighest / limitLowest,
    1 / brackets.length
  );

  // TODO: Add calculation to limit which brackets will be funded and which ones wont
  const splitCenter = Math.round(brackets.length / 2);

  const depositsQuote = Array(splitCenter)
    .fill(0)
    .map((_, bracketIndex) => {
      const deposit = {
        amount: toBN(depositQuote).div(toBN(splitCenter)).toString(),
        tokenAddress: tokenQuoteContract.options.address,
        token: tokenQuoteContract,
        bracketAddress: brackets[bracketIndex],
      };

      return deposit;
    });

  const depositsBase = Array(brackets.length - splitCenter)
    .fill(0)
    .map((_, bracketIndex) => {
      const deposit = {
        amount: toBN(depositBase)
          .div(toBN(brackets.length - splitCenter))
          .toString(),
        tokenAddress: tokenBaseContract.options.address,
        token: tokenBaseContract,
        bracketAddress: brackets[splitCenter + bracketIndex],
      };

      return deposit;
    });

  const deposits = [...depositsQuote, ...depositsBase];

  const approveAndDepositTransactionsData = await Promise.all(
    deposits.map(async (deposit) => {
      const approveTxData = deposit.token.methods
        .transfer(deposit.bracketAddress, deposit.amount)
        .encodeABI();
      const depositTxData = exchange.methods
        .deposit(deposit.tokenAddress, deposit.amount)
        .encodeABI();

      const multiTx = [
        {
          operation: 0,
          to: deposit.tokenAddress,
          value: 0,
          data: approveTxData,
        },
        {
          operation: 0,
          to: exchange.options.address,
          value: 0,
          data: depositTxData,
        },
      ];

      return multiTx;
    })
  );

  const mutliSendHexData = approveAndDepositTransactionsData
    .flat()
    .map((tx) =>
      [
        instance.eth.abi.encodeParameter("uint8", tx.operation).slice(-2),
        instance.eth.abi.encodeParameter("address", tx.to).slice(-40),
        instance.eth.abi.encodeParameter("uint256", tx.value).slice(-64),
        instance.eth.abi
          .encodeParameter("uint256", web3.utils.hexToBytes(tx.data).length)
          .slice(-64),
        tx.data.replace(/^0x/, ""),
      ].join("")
    )
    .join("");

  const txDataMultiSend = multiSend.methods
    .multiSend(`0x${mutliSendHexData}`)
    .encodeABI();

  const sigs =
    "0x" +
    "000000000000000000000000" +
    owner.replace("0x", "") +
    "0000000000000000000000000000000000000000000000000000000000000000" +
    "01";
  const executeTx = masterSafeContract.methods
    .execTransaction(
      multiSend.options.address,
      0,
      txDataMultiSend,
      0,
      0,
      0,
      0,
      "0x" + "0".repeat(40),
      "0x" + "0".repeat(40),
      sigs
    )
    .encodeABI();

  const transaction = {
    operation: 0,
    to: owner,
    value: 0,
    data: executeTx,
  };

  console.log(transaction);
  console.log(deposits);

  return sdk.sendTransactions([transaction]);
};

export default orderAndFund;
