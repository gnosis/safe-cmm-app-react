# Safe Gnosis Protocol Conditional Market Maker App

This Repository includes the Gnosis Safe App for Gnosis Protocol

# Development

Run via `npm run start`

The following environment variables may be required:
```
NETWORK - default: 'local' - 'rinkeby', 'mainnet', etc (see utils/initWeb3.js)
INFURA_API_KEY - default: null - Enter your Infura API token here to allow remote blockchain read access
```

Use ngrok to tunnel (`ngrok http 8080`) and add URL in gnosis safe's "App" section.

# Build

`npm run build`

