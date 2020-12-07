#!/bin/bash

set -evo pipefail

# Some caveats about Infura IPFS:
# - Data is currently pinned until it’s been 6 months since it was last used
# - There is a 100mb single upload limit
# More info: https://blog.infura.io/part-2-getting-started-with-ipfs-on-infura/

# -O option: to not try to open a browser using IPFS url
npx ipfs-deploy -p infura -O dist
