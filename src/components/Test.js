import React, { useCallback, useContext } from 'react'

import { Web3Context } from './Web3Provider'

const Test = ({ sdk }) => {
  const ctx = useContext(Web3Context);
  const handleWrapETH = useCallback(async () => {

  }, [])
  const handleUnwrapETH = useCallback(async () => {

  }, [])

  return (
    <div>
      <button type="button" name="wrap_all_eth" onClick={handleWrapETH}>Wrap my ETH</button>
      <button type="button" name="unwrap_all_eth" onClick={handleUnwrapETH}>Unwrap my ETH</button>
    </div>
  )
}

export default Test