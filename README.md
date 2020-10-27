# Safe Gnosis Protocol Custom Market Maker App
[![Build Status](https://travis-ci.com/gnosis/safe-cmm-app-react.svg?branch=development)](https://travis-ci.com/gnosis/safe-cmm-app-react)

[Development Environment](https://safe-cmm.dev.gnosisdev.com)

[Mainnet Environment](https://safe-cmm.mainnet.gnosisdev.com) **USE AT OWN RISK**


This Repository includes the Gnosis Safe App Integration for deploying Gnosis Protocol Custom Market Makers

# Development

Run via `npm run start`

The following environment variables are required:
```
INFURA_API_KEY - default: null - Enter your Infura API token here to allow remote blockchain read access
```

To run this as a safe-app, it's best to use `rinkeby.gnosis-safe.io` for testing. There's two ways of 
setting up your dev-env to allow you to quickly debug and work while you're using this app as an
integrated Gnosis Safe App.

### Method 1
With an ngrok pro-account (Basic tier is enough), run the included example ngrok config via `ngrok tunnel webpack`,
this will tunnel the webpack-dev-server with it's websocket to an https address that you need to configure in 
`webpack.config.js` in `devServer.host`
Add the tunneled URL to the Safe as a "custom app" and you're good to go.

### Method 2
Use a local dev certificate and run the dev-server in https. Adding `https://localhost:8080` to the safe-app will work
for local development. You will need to install a localhost certificate to use this method.
- Windows
  - Open the URL in a different tab, click the Lock icon in the status bar and add the certificate to windows.
- [OSX](https://gist.github.com/pgilad/63ddb94e0691eebd502deee207ff62bd)

# Build

With the above mentioned ENV variables exported run
`npm run build`

