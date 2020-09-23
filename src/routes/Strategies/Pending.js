import React, { useEffect, useContext, useCallback, useState } from "react";

import findPendingStrategiesForOwner from "api/safe/findPendingStrategiesForOwner";

import { Web3Context } from "components/Web3Provider";

import { Loader } from "@gnosis.pm/safe-react-components";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@material-ui/core";

import Decimal from "decimal.js";
const Pending = () => {
  const context = useContext(Web3Context);
  const [strategies, setStrategies] = useState(null);
  const handleLoadPending = useCallback(async () => {
    const pendingStrategies = await findPendingStrategiesForOwner(context);
    setStrategies(pendingStrategies);
    console.log(pendingStrategies);
  }, [context]);

  useEffect(() => {
    handleLoadPending();
  }, []);

  if (!strategies) {
    return (
      <div>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Created</TableCell>
            <TableCell>Token Pair</TableCell>
            <TableCell>Nonce</TableCell>
            <TableCell>Price Range</TableCell>
            <TableCell>Brackets</TableCell>
            <TableCell>Status</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {strategies.map((strategy) => {
            return (
              <TableRow key={strategy.transactionHash}>
                <TableCell>{strategy.created.toLocaleString()}</TableCell>
                <TableCell>
                  {strategy.quoteTokenDetails?.symbol} -{" "}
                  {strategy.baseTokenDetails?.symbol}
                </TableCell>
                <TableCell>{strategy.nonce}</TableCell>
                <TableCell>
                  {strategy.prices[0]
                    .div(
                      new Decimal(
                        Math.pow(
                          10,
                          strategy.quoteTokenDetails.decimals -
                            strategy.baseTokenDetails.decimals
                        )
                      )
                    )
                    // .div(Math.pow(10, strategy.quoteTokenDetails.decimals))
                    .toSD(4)
                    .toString()}
                  {" - "}
                  {strategy.prices[strategy.prices.length - 1]
                    .div(
                      new Decimal(
                        Math.pow(
                          10,
                          strategy.quoteTokenDetails.decimals -
                            strategy.baseTokenDetails.decimals
                        )
                      )
                    )
                    // .div(Math.pow(10, strategy.baseTokenDetails.decimals))
                    .toSD(4)
                    .toString()}{" "}
                  {strategy.quoteTokenDetails.symbol} per{" "}
                  {strategy.baseTokenDetails.symbol}
                </TableCell>
                <TableCell>{strategy.bracketAddresses.length}</TableCell>
                <TableCell>Waiting to be confirmed</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Pending;
