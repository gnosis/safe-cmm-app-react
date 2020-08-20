import React, { useMemo, useState, useCallback, useContext } from "react";
import styled from "styled-components";

// import { useHistory } from "react-router-dom"

import deployStrategy from "api/deployStrategy";

import asWei from "utils/asWei";

import { Web3Context } from "components/Web3Provider";
import { Box } from "@material-ui/core";
import {
  Text,
  Select,
  TextField,
  Button,
  Divider,
} from "@gnosis.pm/safe-react-components";

import HorizontalBox from "components/HorizontalBox";

const useFormField = (defaultValue) => {
  const [fieldValue, setFieldValue] = useState(defaultValue);

  const handleChangeValue = useCallback((eventOrValue) => {
    if (typeof eventOrValue === "object" && eventOrValue.target != null) {
      setFieldValue(eventOrValue.target.value);
    } else {
      setFieldValue(eventOrValue);
    }
  }, []);

  return [fieldValue, handleChangeValue];
};

const DEFAULT_NUM_SAFES = 10;
const TOKENS_AVAILABLE = [
  {
    name: "WETH9",
    address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  },
  {
    name: "DAI",
    address: "0xeF77ce798401dAc8120F77dc2DebD5455eDdACf9",
  },
  {
    name: "GNO",
    address: "0x333EDe87B78D89D8F7B670488Efe96B9797dB635",
  },
];

const FormBox = styled(Box)`
  max-width: 600px;
`;

const Deploy = () => {
  const web3Context = useContext(Web3Context);

  /*
  const history = useHistory();

  const handleNavigateToActive = useCallback(() => {
    history.replace("/active");
  }, [history]);
  */

  const [tokenAddressBase, setTokenAddressBase] = useFormField(null);
  const [tokenAddressQuote, setTokenAddressQuote] = useFormField(null);

  const [numBrackets, setNumBrackets] = useFormField(DEFAULT_NUM_SAFES);
  const [boundsLowerEth, setBoundsLowerEth] = useFormField(null);
  const [boundsUpperEth, setBoundsUpperEth] = useFormField(null);
  const [investmentBaseEth, setInvestmentBaseEth] = useFormField(null);
  const [investmentQuoteEth, setInvestmentQuoteEth] = useFormField(null);

  const tokenSelectValues = useMemo(
    () =>
      TOKENS_AVAILABLE.map(({ name, address, icon }) => ({
        id: address,
        label: name,
        iconUrl: icon,
      })),
    []
  );

  const handleDeploy = useCallback(async () => {
    await deployStrategy(
      web3Context,
      numBrackets,
      tokenAddressBase,
      tokenAddressQuote,
      asWei(boundsLowerEth),
      asWei(boundsUpperEth),
      asWei(investmentBaseEth),
      asWei(investmentQuoteEth)
    );
    /*
    sdk.sendTransactions([
      {
        to: contract.options.address,
        value: 1e18, // 1 ETH
        data: contract.methods.deposit().encodeABI(),
      },
    ]);
    */
  }, [
    web3Context,
    boundsLowerEth,
    boundsUpperEth,
    investmentBaseEth,
    investmentQuoteEth,
    numBrackets,
    tokenAddressBase,
    tokenAddressQuote,
  ]);

  return (
    <Box>
      <FormBox>
        <Text size="md">Pick a token pair</Text>
        <HorizontalBox>
          <Select
            activeItemId={tokenAddressBase || ""}
            onItemClick={setTokenAddressBase}
            items={tokenSelectValues}
          />
          <Text size="md">&nbsp;{"<->"}&nbsp;</Text>
          <Select
            activeItemId={tokenAddressQuote || ""}
            onItemClick={setTokenAddressQuote}
            items={tokenSelectValues}
          />
        </HorizontalBox>
        <Text size="md">Price of Base Token</Text>
      </FormBox>
      <FormBox>
        <HorizontalBox>
          <TextField
            label="Lowest Price"
            name="boundaryLowestPrice"
            value={boundsLowerEth || ""}
            onChange={setBoundsLowerEth}
            endAdornment={<Text size="md">USDC</Text>}
          />

          <TextField
            label="Brackets"
            name="numBrackets"
            onChange={setNumBrackets}
            value={numBrackets}
          />

          <TextField
            label="Highest Price"
            name="boundaryHighestPrice"
            value={boundsUpperEth || ""}
            onChange={setBoundsUpperEth}
            endAdornment={<Text size="md">USDC</Text>}
          />
        </HorizontalBox>
        <HorizontalBox>
          <TextField
            label="Investment of Base Tokens"
            name="investmentBaseEth"
            value={investmentBaseEth || ""}
            onChange={setInvestmentBaseEth}
            endAdornment={<Text size="md">USDC</Text>}
          />
          <TextField
            label="Investment of Quote Tokens"
            name="investmentQuoteEth"
            value={investmentQuoteEth || ""}
            onChange={setInvestmentQuoteEth}
            endAdornment={<Text size="md">USDC</Text>}
          />
        </HorizontalBox>
      </FormBox>
      <FormBox>
        <Divider />
        <Button
          size="lg"
          color="primary"
          variant="contained"
          onClick={handleDeploy}
        >
          Deploy
        </Button>
      </FormBox>
    </Box>
  );
};

export default Deploy;
