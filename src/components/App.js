import React, { useState } from 'react'
import { hot } from 'react-hot-loader/root';

import Test from './Test'
import Web3Provider from './Web3Provider'

import initSdk from '@gnosis.pm/safe-apps-sdk';

const App = () => {
  const [appsSdk] = useState(initSdk());
  
  return (
    <Web3Provider>
      <Test sdk={appsSdk} />
    </Web3Provider>
  )
}

export default hot(App);