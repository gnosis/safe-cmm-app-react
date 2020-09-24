import { Web3Context, TokenDetails } from 'types';
import find from "lodash/find";
import web3 from 'web3'

import BN from 'bn.js';
import Decimal from 'decimal.js';

const { toBN } = web3.utils;

// const logger = getLogger('pending-strategy');

<<<<<<< HEAD
interface Decode_Value {
=======
interface DecoderValue {
>>>>>>> feature/#34/pending-strategy-discovery
  operation: number;
  to: string;
  value: number;
  data: string;
<<<<<<< HEAD
  dataDecoded: Decode_Data;
}

interface Decode_Parameter {
  name: string;
  type: string,
  value: string,
  valueDecoded: Decode_Value[] | Decode_Data;
}

interface Decode_Data {
  method: string;
  parameters: Decode_Parameter[];
}

interface Decode_Node {
  data: Decode_Data | Decode_Parameter | Decode_Value;
  parent: Decode_Node,
=======
  dataDecoded: DecoderData;
}

interface DecoderParameter {
  name: string;
  type: string,
  value: string,
  valueDecoded: DecoderValue[] | DecoderData;
}

interface DecoderData {
  method: string;
  parameters: DecoderParameter[];
}

interface TxTreeNode {
  data: DecoderData | DecoderParameter | DecoderValue;
  parent: TxTreeNode,
>>>>>>> feature/#34/pending-strategy-discovery
}

class PendingStrategy {
  transactionHash : string;
  safeAddresses : string[];
  bracketAddresses : string[];
  prices: Decimal[];
  nonce: number;
  baseTokenId : number;
  quoteTokenId : number;
  baseTokenAddress : string;
  quoteTokenAddress : string;
  baseTokenDetails : TokenDetails;
  quoteTokenDetails : TokenDetails;
  baseFunding : BN;
  quoteFunding : BN;
  owner : string;
  created : Date;
  block : any;
<<<<<<< HEAD
  transactionData : Decode_Data;
=======
  transactionData : DecoderData;
>>>>>>> feature/#34/pending-strategy-discovery

  constructor(pendingStrategyTransaction : any) {
    this.transactionHash = pendingStrategyTransaction.safeTxHash;
    this.transactionData = pendingStrategyTransaction.dataDecoded;
    this.nonce = pendingStrategyTransaction.nonce;
    this.created = new Date(pendingStrategyTransaction.submissionDate);
  }

<<<<<<< HEAD
  findParamsInTransactionData(transactionData : Decode_Data) : void {
=======
  findParamsInTransactionData(transactionData : DecoderData) : void {
>>>>>>> feature/#34/pending-strategy-discovery
    let sumFundingTokenBase = toBN(0);
    let sumFundingTokenQuote = toBN(0);

    let tokenIdBase;
    let tokenIdQuote;

    let prices = [];

    let bracketAddresses = [];

    if (transactionData.method !== "multiSend") {
      throw new Error("Expected multiSend to handle pending transaction walking");
    }

    // let depth = 0

    // This function is responsible for "walking" down the transaction graph.
    // The reason I consider the structure a graph is because of mutliSend there can be
    // potentially extremely deeply nested transactions. Decode_Node includes a parent ref
    // to traverse the tree up and down.
<<<<<<< HEAD
    let walkTransaction = (node : Decode_Node) : void => {
      // depth++;
      //console.log(`${"  ".repeat(depth)}==> Walking "${txData.method}" with ${txData.parameters.length} params`)
      const txData = node.data as Decode_Data;
=======
    let walkTransaction = (node : TxTreeNode) : void => {
      // depth++;
      //console.log(`${"  ".repeat(depth)}==> Walking "${txData.method}" with ${txData.parameters.length} params`)
      const txData = node.data as DecoderData;
>>>>>>> feature/#34/pending-strategy-discovery

      if (txData.method === "placeOrder") {
        // logger.log('Reading decoded placeOrder', txData);
        // In placeOrder events we will find the buyToken/sellToken, the buy/sellAmounts (prices)
        // and if we collect the `to` addresses, the bracket addresses.

        // Find buy and sell token. The first occurrences will be used to determine base/quote
        // FIXME: I don't know how reliable this will be - it's an assumption that might be wrong
        //        It might be possible to compare this with current prices for this token pair
        //        and to do a sanity check if the prices are clsoe enough?
        const tokenIdBuy = find(txData.parameters, { name: 'buyToken' })?.value;
        const tokenIdSell = find(txData.parameters, { name: 'sellToken' })?.value;
        if (tokenIdBase == null && tokenIdQuote == null) {
          tokenIdBase = tokenIdBuy;
          tokenIdQuote = tokenIdSell;
        }

        // Amounts to sell and buy in eth-wei
        const sellAmount = find(txData.parameters, { name: 'buyAmount' })?.value || "0";
        const buyAmount = find(txData.parameters, { name: 'sellAmount' })?.value || "0";
        // Check to see if we sum onto base/quote depending on which tokenId we have
        if (tokenIdBase === tokenIdBuy) {
          prices.push(new Decimal(buyAmount).div(sellAmount))
          sumFundingTokenBase.iadd(toBN(buyAmount));
          sumFundingTokenQuote.iadd(toBN(sellAmount));
        } else {
          prices.push(new Decimal(sellAmount).div(buyAmount))
          sumFundingTokenBase.iadd(toBN(sellAmount));
          sumFundingTokenQuote.iadd(toBN(buyAmount));
        }

        // Collect bracket address, as this transaction will be executed from a bracket
        const bracketAddress = (
          node
            .parent // placeOrder
            .parent // execTransaction param
            .parent // multiSend param
<<<<<<< HEAD
            .data as Decode_Value).to;
=======
            .data as DecoderValue).to;
>>>>>>> feature/#34/pending-strategy-discovery
        if (!bracketAddresses.includes(bracketAddress))
          bracketAddresses.push(bracketAddress)
      }

<<<<<<< HEAD
      txData.parameters.forEach((parameter : Decode_Parameter) :void => {
=======
      txData.parameters.forEach((parameter : DecoderParameter) :void => {
>>>>>>> feature/#34/pending-strategy-discovery
        if (parameter != null && parameter.valueDecoded != null) {
          //console.log(parameter.valueDecoded)
  
          if (Array.isArray(parameter.valueDecoded)) {
            // If valueDecoded is an Array, treat as Decode_Value
<<<<<<< HEAD
            parameter.valueDecoded.forEach((parameterValue : Decode_Value) : void => {
=======
            parameter.valueDecoded.forEach((parameterValue : DecoderValue) : void => {
>>>>>>> feature/#34/pending-strategy-discovery
              if (parameterValue && parameterValue.dataDecoded != null) {
                walkTransaction({
                  data: parameterValue.dataDecoded,
                  parent: {
                    data: parameterValue,
                    parent: node,
                  },
                });
              }
            });
          } else {
            // if valueDecoded is no array, it's Decode_Data
            if (parameter.valueDecoded && parameter.valueDecoded.parameters) {
              walkTransaction({
<<<<<<< HEAD
                data: parameter.valueDecoded as Decode_Data,
=======
                data: parameter.valueDecoded as DecoderData,
>>>>>>> feature/#34/pending-strategy-discovery
                parent: {
                  data: parameter,
                  parent: node,
                },
              });
            }
          }
        }
      });
      // depth--;
    }

    walkTransaction({
      data: transactionData,
      parent: null
    });

    this.prices = prices;
    this.baseTokenId = tokenIdBase;
    this.quoteTokenId = tokenIdQuote;

    this.baseFunding = sumFundingTokenBase;
    this.quoteFunding = sumFundingTokenQuote;

    this.bracketAddresses = bracketAddresses;
  }
  
  async findFromPendingTransactions(context : Web3Context) : Promise<void> {
    this.findParamsInTransactionData(this.transactionData);

    // Prefetch before we initialize tradingHelper
    await Promise.all([
      context.getArtifact("IProxy"),
      context.getArtifact("GnosisSafe"),
      context.getArtifact("MultiSend"),
      context.getArtifact("GnosisSafeProxyFactory"),
      context.getArtifact("FleetFactory"),
      context.getArtifact("FleetFactoryDeterministic"),
      context.getArtifact("BatchExchange"),
    ])

    const batchExchangeContract = await context.getDeployed("BatchExchange");
    const [tokenBaseAddress, tokenQuoteAddress] = await Promise.all([
      batchExchangeContract.methods
        .tokenIdToAddressMap(this.baseTokenId)
        .call(),
      batchExchangeContract.methods
        .tokenIdToAddressMap(this.quoteTokenId)
        .call(),
    ]);
    this.baseTokenAddress = tokenBaseAddress;
    this.quoteTokenAddress = tokenQuoteAddress;

    this.baseTokenDetails = await context.getErc20Details(this.baseTokenAddress);
    this.quoteTokenDetails = await context.getErc20Details(this.quoteTokenAddress);
  }
}

export default PendingStrategy;