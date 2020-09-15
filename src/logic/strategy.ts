import { Web3Context, TokenDetails } from 'types';
import web3GLib from "web3"

const { toBN } = web3GLib.utils;

let globalResolvedTokenPromises = {};

interface Bracket {
  address : string;
  events : any[];
  deposits: DepositEvent[];
  withdrawRequests: WithdrawEvent[];
  withdraws: any[];
}

interface DepositEvent {
  amount : string; // BN string
  token : string;
  batchId : number;
}

interface WithdrawEvent {
  amount : string;
  batchId : number;
  created : Date;
}

class Strategy {
  transactionHash : string;
  safeAddresses : string[];
  brackets : Bracket[];
  startBlockNumber: number;
  baseTokenId : number;
  quoteTokenId : number;
  baseTokenAddress : string;
  quoteTokenAddress : string;
  baseTokenDetails : TokenDetails;
  quoteTokenDetails : TokenDetails;
  baseFunding : string;
  quoteFunding : string;
  owner : string;
  created : Date;
  block : any;
  lastWithdrawRequestEvent : WithdrawEvent;
  lastWithdrawClaimEvent : any;

  constructor(fleetDeployEvent : any) {
    this.transactionHash = fleetDeployEvent.transactionHash;
    this.startBlockNumber = fleetDeployEvent.blockNumber;
    this.safeAddresses = fleetDeployEvent.returnValues.fleet;
    this.owner = fleetDeployEvent.returnValues.owner;
    this.lastWithdrawRequestEvent = null;
    this.lastWithdrawClaimEvent = null;
  }

  async fetchAllPossibleInfo(context : Web3Context) : Promise<void> {
    // Find creation date by block number
    this.block = await context.instance.eth.getBlock(this.startBlockNumber);
    this.created = new Date(this.block.timestamp * 1000);

    // Find all placed orders, to determine the brackets, token pairs and funding
    const batchExchangeContract = await context.getDeployed("BatchExchange");

    let tokenIdSold;
    let tokenIdBought;
    let orderBatchIds = [];
    let withdrawRequestBlocks = {};

    const brackets = await Promise.all(this.safeAddresses.map(async (bracketAddress) : Promise<Bracket> => {
      // Bracket orders find the tokens used for the strategy
      const bracketOrderEvents = await batchExchangeContract.getPastEvents("OrderPlacement", {
        fromBlock: this.startBlockNumber-1,
        filter: { owner: bracketAddress }
      })

      if (bracketOrderEvents.length > 0) {
        const firstBracketEvent = bracketOrderEvents[0]
        tokenIdSold = firstBracketEvent.returnValues.sellToken;
        tokenIdBought = firstBracketEvent.returnValues.buyToken;
      }

      // Bracket Deposits find the funding used for the strategy
      const bracketDepositEvents = await batchExchangeContract.getPastEvents("Deposit", {
        fromBlock: this.startBlockNumber-1,
        filter: { user: bracketAddress }
      });

      const withdrawClaims = await batchExchangeContract.getPastEvents("Withdraw", {
        fromBlock: this.startBlockNumber-1,
        filter: { user: bracketAddress }
      })

      let withdrawRequestsWithBlock : WithdrawEvent[] = []
      if (bracketDepositEvents[0]) {
        const withdrawRequests = await batchExchangeContract.getPastEvents("WithdrawRequest", {
          fromBlock: this.startBlockNumber-1,
          filter: { batchId: bracketDepositEvents[0].batchId, user: bracketAddress }
        });
  
        withdrawRequestsWithBlock = await Promise.all(
          withdrawRequests.map(async (withdrawRequest) : Promise<WithdrawEvent> => {
            if (!withdrawRequestBlocks[withdrawRequest.blockNumber]) {
              withdrawRequestBlocks[withdrawRequest.blockNumber] = await context.instance.eth.getBlock(withdrawRequest.blockNumber);
            }
  
            return {
              amount: withdrawRequest.returnValues.amount,
              batchId: parseInt(withdrawRequest.returnValues.batchId, 10),
              created: new Date(withdrawRequestBlocks[withdrawRequest.blockNumber].timestamp * 1000),
            }
          })
        )  
      }

      const deposits = bracketDepositEvents
        .map((event) : DepositEvent => {
          return {
            token: event.returnValues.token,
            amount: event.returnValues.amount,
            batchId: event.returnValues.batchId,
          }
        })

      deposits.forEach(({ batchId }) : void => {
        if (!orderBatchIds.includes(batchId)) {
          orderBatchIds.push(batchId)
        }
      })

      return {
        address: bracketAddress,
        events: bracketOrderEvents,
        withdrawRequests: withdrawRequestsWithBlock,
        withdraws: withdrawClaims,
        deposits,
      }
    }))





    this.baseTokenId = tokenIdSold;
    this.quoteTokenId = tokenIdBought;
    this.baseFunding = null;
    this.quoteFunding = null;

    if (tokenIdSold != null) {
      if (!globalResolvedTokenPromises[this.baseTokenId]) {
        globalResolvedTokenPromises[this.baseTokenId] = batchExchangeContract.methods.tokenIdToAddressMap(this.baseTokenId).call()
      }
      this.baseTokenAddress = await globalResolvedTokenPromises[this.baseTokenId]
      this.baseTokenDetails = await context.getErc20Details(this.baseTokenAddress)
    }
    if (tokenIdBought != null) {
      if (!globalResolvedTokenPromises[this.quoteTokenId]) {
        globalResolvedTokenPromises[this.quoteTokenId] = batchExchangeContract.methods.tokenIdToAddressMap(this.quoteTokenId).call()
      }
      this.quoteTokenAddress = await globalResolvedTokenPromises[this.quoteTokenId]
      this.quoteTokenDetails = await context.getErc20Details(this.quoteTokenAddress)
    }
    let baseFundingBn = toBN(0);
    let quoteFundingBn = toBN(0);
    if (brackets) {
      brackets.forEach((bracket) : void => {
        bracket.deposits.forEach((deposit) : void => {
          if (deposit.token === this.baseTokenAddress) {
            baseFundingBn.iadd(toBN(deposit.amount)) 
          }
          if (deposit.token === this.quoteTokenAddress) {
            quoteFundingBn.iadd(toBN(deposit.amount))
          }
        })
      })  
    }
    this.baseFunding = baseFundingBn.toString();
    this.quoteFunding = quoteFundingBn.toString();

    this.lastWithdrawRequestEvent = brackets[0]?.withdrawRequests[0];
    this.lastWithdrawClaimEvent = brackets[0]?.withdraws[0];

    this.brackets = brackets;
  }
}

export default Strategy;