import React, { useEffect, useCallback, useState, useMemo } from 'react'
import initWeb3 from '../utils/initWeb3';

export const Web3Context = React.createContext({
  instance: null,
  status: 'UNKNOWN'
})

const Web3Provider = ({ children }) => {
  const [status, setStatus] = useState('UNKNOWN')
  const [instance, setInstance] = useState(null);

  const handleInit = useCallback(async () => {
    setStatus('LOADING')

    try {
      const newInstance = await initWeb3();
      setInstance(newInstance);
      setStatus('SUCCESS')
    } catch (err) {
      console.error(err)
      setInstance(null);
      setStatus('ERROR');
    }
  })
  console.log(status, instance)

  const handleAsyncInit = useCallback(() => {
    handleInit();
  })

  useEffect(handleAsyncInit, [])

  const contextState = useMemo(() => ({status, instance}), [status, instance])

  return (
    <Web3Context.Provider value={contextState}>
      {status === 'SUCCESS' ? (
        children
      ) : (
        <p>Loading</p>
      )}
    </Web3Context.Provider>
  )
}

export default Web3Provider;