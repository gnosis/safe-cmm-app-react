import React, { useCallback, useContext } from "react";

import { useHistory } from "react-router-dom";

import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@material-ui/core";
import Heading from "components/Heading";
import { ButtonLink, Button } from "@gnosis.pm/safe-react-components";
import useWeb3Strategies from "hooks/useWeb3Strategies";

import { Web3Context } from "components/Web3Provider";

import withdrawFunds from "api/withdrawFunds";

const Active = () => {
  const history = useHistory();
  const handleNavigateToDeploy = useCallback(() => {
    history.replace("/deploy");
  }, [history]);

  const context = useContext(Web3Context);
  const { strategies, status } = useWeb3Strategies();
  console.log(strategies);

  const makeHandleWithdraw = useCallback(
    (strategy) => async () => {
      console.log(strategy.blockHash);
      await withdrawFunds(context, strategy);
    },
    [context]
  );

  return (
    <Box>
      <Heading
        title="Active Strategies"
        navigationItems={
          <ButtonLink onClick={handleNavigateToDeploy} color="primary">
            Deploy new Strategy
          </ButtonLink>
        }
      />
      <Box>
        {status}
        {status === "SUCCESS" && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Created</TableCell>
                  <TableCell>Token Pair</TableCell>
                  <TableCell>Start Price</TableCell>
                  <TableCell>Brackets</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {strategies.map((strategy) => (
                  <TableRow key={strategy.transactionHash}>
                    <TableCell>{strategy.created.toLocaleString()}</TableCell>
                    <TableCell>
                      {strategy.quoteTokenDetails?.symbol} -{" "}
                      {strategy.baseTokenDetails?.symbol}
                    </TableCell>
                    <TableCell>TODO</TableCell>
                    <TableCell>{strategy.brackets.length}</TableCell>
                    <TableCell>
                      <Button
                        size="lg"
                        color="primary"
                        variant="contained"
                        onClick={makeHandleWithdraw(strategy)}
                      >
                        Withdraw
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default Active;
