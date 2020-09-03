import React, {
  useMemo,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import styled from "styled-components";

// import { useHistory } from "react-router-dom"

import deployStrategy from "api/deployStrategy";

import asWei from "utils/asWei";

import HorizontalBox from "components/HorizontalBox";
import { Web3Context } from "components/Web3Provider";
import { Box, Grid, makeStyles } from "@material-ui/core";
import {
  Text,
  Select,
  TextField,
  Button,
  Loader,
} from "@gnosis.pm/safe-react-components";
import { getOneinchPrice } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";

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

const FormBox = styled(Box)`
  max-width: 600px;
  padding: 18px 12px;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  display: flex;
`;

const useStyles = makeStyles(() => ({
  textField: {
    maxWidth: "100%",
  },
  selectField: {
    width: "152px",
  },
}));

const Deploy = () => {
  const web3Context = useContext(Web3Context);
  const classes = useStyles();

  /*
  const history = useHistory();

  const handleNavigateToActive = useCallback(() => {
    history.replace("/active");
  }, [history]);
  */
  const [error, setError] = useState(null);
  const [tokenCurrentPrice, setTokenCurrentPrice] = useState(null);

  const [tokenAddressBase, setTokenAddressBase] = useFormField(null);
  const [tokenAddressQuote, setTokenAddressQuote] = useFormField(null);

  const [numBrackets, setNumBrackets] = useFormField(DEFAULT_NUM_SAFES);
  const [boundsLowerEth, setBoundsLowerEth] = useFormField(null);
  const [boundsUpperEth, setBoundsUpperEth] = useFormField(null);
  const [investmentBaseEth, setInvestmentBaseEth] = useFormField(null);
  const [investmentQuoteEth, setInvestmentQuoteEth] = useFormField(null);
  const [priceStatus, setPriceStatus] = useState("NO_TOKEN");

  const [tokenBaseDetails, setTokenBaseDetails] = useState(null);
  const [tokenQuoteDetails, setTokenQuoteDetails] = useState(null);

  useEffect(() => {
    if (tokenAddressBase) {
      web3Context.getErc20Details(tokenAddressBase).then(setTokenBaseDetails);
    }
    if (tokenAddressQuote) {
      web3Context.getErc20Details(tokenAddressQuote).then(setTokenQuoteDetails);
    }
  }, [web3Context, tokenAddressBase, tokenAddressQuote]);

  useEffect(() => {
    if (tokenBaseDetails && tokenQuoteDetails) {
      (async () => {
        setPriceStatus("LOADING");
        const { price } = await getOneinchPrice(
          tokenBaseDetails,
          tokenQuoteDetails
        );
        console.log(price);

        setTokenCurrentPrice(price);
        setPriceStatus("SUCCESS");
      })();
    } else {
      setPriceStatus("NO_TOKEN");
    }
  }, [web3Context, tokenBaseDetails, tokenQuoteDetails]);

  const tokenSelectValues = useMemo(
    () =>
      web3Context.tokenList.map(({ name, address, icon }) => ({
        id: address,
        label: name,
        iconUrl: icon,
      })),
    [web3Context]
  );

  const handleDeploy = useCallback(async () => {
    setError(null);
    try {
      await deployStrategy(
        web3Context,
        numBrackets,
        tokenAddressBase,
        tokenAddressQuote,
        asWei(boundsLowerEth),
        asWei(boundsUpperEth),
        asWei(investmentBaseEth),
        asWei(investmentQuoteEth),
        asWei(tokenCurrentPrice.toString())
      );
    } catch (err) {
      console.error(`Deployment failed with error: ${err.message}`);
      setError(err.message);
      throw err;
    }

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
    tokenCurrentPrice,
  ]);

  return (
    <Box>
      <FormBox>
        <Grid container spacing={3}>
          <Grid container item xs={12}>
            <Grid item xs={5}>
              <Box>
                <Select
                  className={classes.selectField}
                  activeItemId={tokenAddressBase || ""}
                  onItemClick={setTokenAddressBase}
                  items={tokenSelectValues}
                />
              </Box>
            </Grid>
            <Grid container item xs={2} justify="center" alignItems="center">
              <Grid item xs={12}>
                <Text size="md" center>
                  {"<->"}
                </Text>
              </Grid>
            </Grid>
            <Grid item xs={5}>
              <Box>
                <Select
                  className={classes.selectField}
                  activeItemId={tokenAddressQuote || ""}
                  onItemClick={setTokenAddressQuote}
                  items={tokenSelectValues}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {priceStatus !== "NO_TOKEN" && (
              <HorizontalBox>
                <Text size="md">
                  Market price:{" "}
                  {priceStatus === "LOADING" ? (
                    <Loader size="xs" />
                  ) : (
                    tokenCurrentPrice?.toFixed(4)
                  )}{" "}
                  <strong>{tokenBaseDetails?.symbol}</strong> per{" "}
                  <strong>{tokenQuoteDetails?.symbol}</strong>
                </Text>
              </HorizontalBox>
            )}
          </Grid>
          <Grid container item xs={12} spacing={4}>
            <Grid container item xs={4} spacing={2}>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    label="Lowest Price"
                    name="boundaryLowestPrice"
                    className={classes.textField}
                    value={boundsLowerEth || ""}
                    onChange={setBoundsLowerEth}
                    endAdornment={
                      <Text size="md">{tokenBaseDetails?.symbol}</Text>
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    label="Funding"
                    name="investmentBaseEth"
                    className={classes.textField}
                    value={investmentBaseEth || ""}
                    onChange={setInvestmentBaseEth}
                    endAdornment={
                      <Text size="md">{tokenBaseDetails?.symbol}</Text>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container item xs={4} spacing={2}>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    label="Current Price"
                    name="currentPrice"
                    className={classes.textField}
                    value={tokenCurrentPrice?.toFixed(4) || ""}
                    readOnly
                    endAdornment={
                      <Text size="md">{tokenBaseDetails?.symbol}</Text>
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    label="Total Brackets"
                    name="numBrackets"
                    className={classes.textField}
                    type="number"
                    step="1"
                    value={numBrackets || ""}
                    onChange={setNumBrackets}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container item xs={4} spacing={2}>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    label="Highest Price"
                    name="boundsUpperEth"
                    className={classes.textField}
                    value={boundsUpperEth || ""}
                    onChange={setBoundsUpperEth}
                    endAdornment={
                      <Text size="md">{tokenBaseDetails?.symbol}</Text>
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <TextField
                    label="Funding"
                    name="investmentQuoteEth"
                    className={classes.textField}
                    value={investmentQuoteEth || ""}
                    onChange={setInvestmentQuoteEth}
                    endAdornment={
                      <Text size="md">{tokenQuoteDetails?.symbol}</Text>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={12} spacing={2}>
              <Button
                size="lg"
                color="primary"
                variant="contained"
                onClick={handleDeploy}
              >
                Deploy
              </Button>
            </Grid>
            <Grid item xs={12} spacing={2}>
              {error && (
                <Text size="md">Deployment failed with error: {error}</Text>
              )}
            </Grid>
          </Grid>
        </Grid>
      </FormBox>
    </Box>
  );
};

export default Deploy;
