import { useCallback, useState, useEffect, useContext } from "react"

import findStrategiesForOwner from 'api/web3/findStrategiesForOwner';
import Web3Context from 'components/Web3Provider';

const useWeb3Strategies = () => {
  const [status, setStatus] = useState('PENDING');
  const [strategies, setStrategies] = useState([]);

  const context = useContext(Web3Context);

  const handleFindStrategies = useCallback(async () => {
    setStatus('PENDING');
    try {
      const strategies = await findStrategiesForOwner(context.instance, context.safeInfo.safeAddress)
      setStatus('SUCCESS')
      setStrategies(strategies);
    } catch (err) {
      setStatus('ERROR')
      console.error(err);
    }
  }, [context])

  useEffect(() => { handleFindStrategies() }, [handleFindStrategies])

  return {
    status,
    strategies
  }
}