import 'regenerator-runtime/runtime';

import 'react-hot-loader';
import { render } from 'react-dom'
import React from 'react'

import App from './components/App'

const $rootElement = document.getElementById('root')

render(<App />, $rootElement);