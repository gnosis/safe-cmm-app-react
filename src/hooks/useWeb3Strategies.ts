import { useCallback, useState, useEffect, useContext } from "react"

import findStrategiesForOwner from 'api/web3/findStrategiesForOwner';
import { Web3Context } from 'components/Web3Provider';

import { Web3Context as Web3ContextType } from "types";

const useWeb3Strategies = () : any => {
  const [status, setStatus] = useState('PENDING');
  const [strategies, setStrategies] = useState([]);

  const context : Web3ContextType = useContext(Web3Context);

  const handleFindStrategies = useCallback(async () => {
    setStatus('PENDING');
    try {
      const strategies = await findStrategiesForOwner(context)
      setStatus('SUCCESS')
      setStrategies(strategies);
    } catch (err) {
      setStatus('ERROR')
      console.error(err);
    }
  }, [context])

  useEffect(() => { handleFindStrategies() }, [])
  console.log(status)
  return {
    status,
    strategies
  }
}

export default useWeb3Strategies;