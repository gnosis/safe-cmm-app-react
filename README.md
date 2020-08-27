# Safe Gnosis Protocol Custom Market Maker App

This Repository includes the Gnosis Safe App Integration for deploying Gnosis Protocol Custom Market Makers

# Development

Run via `npm run start`

The following environment variables may be required:
```
NETWORK - default: 'local' - 'rinkeby', 'mainnet', etc (see utils/initWeb3.js)
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
(to be documented)
Use a local dev certificate and run the dev-server in https. Adding `https://localhost:8080` to the safe-app will work
for local development.

# Build

With the above mentioned ENV variables exported run
`npm run build`

