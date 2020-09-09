import { useCallback, useState, useEffect, useContext } from "react"

import getLogger from 'utils/logger';

import findStrategiesForOwner from 'api/web3/findStrategiesForOwner';
import { Web3Context } from 'components/Web3Provider';

import { Web3Context as Web3ContextType } from "types";

const logger = getLogger('web3-strategy-hook');

const useWeb3Strategies = () : any => {
  const [status, setStatus] = useState('LOADING');
  const [strategies, setStrategies] = useState([]);

  const context : Web3ContextType = useContext(Web3Context);

  const handleFindStrategies = useCallback(async () => {
    setStatus('LOADING');
    try {
      const strategies = await findStrategiesForOwner(context)
      logger.log('Active strategies loaded via web3:', strategies)
      setStatus('SUCCESS')
      setStrategies(strategies);
    } catch (err) {
      setStatus('ERROR')
      console.error(err);
    }
  }, [context])

  useEffect(() => { handleFindStrategies() }, [])

  return {
    status,
    strategies
  }
}

export default useWeb3Strategies;