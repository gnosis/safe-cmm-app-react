import { Web3Context, TokenDetails } from 'types';
import find from "lodash/find";
import web3 from 'web3'

import {
  Bracket,
  DepositEvent,
  WithdrawEvent,
} from "./strategy";
import BN from 'bn.js';

const { toBN } = web3.utils;
const ZERO = toBN(0)

import Decimal from "decimal.js";

interface Decode_Value {
  operation: number;
  to: string;
  value: number;
  data: string;
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

class PendingStrategy {
  transactionHash : string;
  safeAddresses : string[];
  brackets : Bracket[];
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
  transactionData : Decode_Data;

  constructor(pendingStrategyTransaction : any) {
    this.transactionHash = pendingStrategyTransaction;
    this.transactionData = pendingStrategyTransaction.dataDecoded;
  }

  findParamsInTransactionData(transactionData : Decode_Data) : void {
    let sumFundingTokenBase = toBN(0);
    let sumFundingTokenQuote = toBN(0);

    let tokenIdBase;
    let tokenIdQuote;

    let pricesBase = [];
    let pricesQuote = [];

    let bracketAddresses = [];

    if (transactionData.method !== "multiSend") {
      throw new Error("Expected multiSend to handle pending transaction walking");
    }

    let depth = 0
    let walkTransaction = (txData : Decode_Data, parent : Decode_Data) : void => {
      depth++;
      console.log(`${"  ".repeat(depth)}==> Walking "${txData.method}" with ${txData.parameters.length} params`)

      if (txData.method === "placeOrder") {
        const tokenIdBuy = find(txData.parameters, { name: 'buyToken' })?.value;
        const tokenIdSell = find(txData.parameters, { name: 'sellToken' })?.value;
        if (tokenIdBase == null && tokenIdQuote == null) {
          tokenIdBase = tokenIdBuy;
          tokenIdQuote = tokenIdSell;
        }
        const sellAmount = find(txData.parameters, { name: 'buyAmount' })?.value || "0";
        const buyAmount = find(txData.parameters, { name: 'sellAmount' })?.value || "0";

        console.log(tokenIdBuy, buyAmount)
        console.log(tokenIdSell, sellAmount)

        if (tokenIdBase === tokenIdBuy) {
          if (toBN(buyAmount).gt(ZERO)) pricesBase.push(buyAmount);
          if (toBN(sellAmount).gt(ZERO)) pricesQuote.push(sellAmount);
          sumFundingTokenBase.iadd(toBN(buyAmount));
          sumFundingTokenQuote.iadd(toBN(sellAmount));
        } else {
          if (toBN(buyAmount).gt(ZERO)) pricesBase.push(buyAmount);
          if (toBN(sellAmount).gt(ZERO)) pricesQuote.push(sellAmount);
          sumFundingTokenBase.iadd(toBN(sellAmount));
          sumFundingTokenQuote.iadd(toBN(buyAmount));
        }

      }

      txData.parameters.forEach((parameter : Decode_Parameter) :void => {
        if (parameter != null && parameter.valueDecoded != null) {
          console.log(parameter.valueDecoded)
  
          if (Array.isArray(parameter.valueDecoded)) {
            // If valueDecoded is an Array, treat as Decode_Value
            parameter.valueDecoded.forEach((parameterValue : Decode_Value) : void => {
              if (parameterValue && parameterValue.dataDecoded != null) {
                walkTransaction(parameterValue.dataDecoded, txData);
              }
            });
          } else {
            // if valueDecoded is no array, it's Decode_Data
            if (parameter.valueDecoded && parameter.valueDecoded.parameters) {
              walkTransaction(parameter.valueDecoded as Decode_Data, txData)
            }
          }
        }
      });
      depth--;
    }

    console.log(`Walking transaction tree for ${transactionData.method}`);
    walkTransaction(transactionData, null);

    this.baseTokenId = tokenIdBase;
    this.quoteTokenId = tokenIdQuote;

    this.baseFunding = sumFundingTokenBase;
    this.quoteFunding = sumFundingTokenQuote;
  }
  
  async findFromPendingTransactions(context : Web3Context) : Promise<void> {
    this.findParamsInTransactionData(this.transactionData);


  }
}

export default PendingStrategy;