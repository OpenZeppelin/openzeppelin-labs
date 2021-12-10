# CCC: CROSS CHAIN CONTRACTS

## Set local test networks

1. Download the optimism monorepo
```
git@github.com:ethereum-optimism/optimism.git
```

2. Go to the ops folder
```
cd optimism/ops
```

3. Build the images
```
make build
```

4. Start the environment
```
make up
```

This starts two blockchains instance
- A L1 instance (hardhat) on `http://127.0.0.1:9545`
- A L2 instance (Optimism-Geth) on `http://127.0.0.1:8545`

You can check the status of these chains using:
```
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":1}' 127.0.0.1:9545
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":1}' 127.0.0.1:8545
```

After some time, the environment should be good. You can follow the deployment container with the following command:
```
docker logs -f ops-deployer-1
```

**Important:** for the test script to work out of the box, the local test networks should be using the defaults values.
Do not override any of the parameters in the dockerfiles.

After you are done, the test networks can be brought down with
```
make down
```

## Running the test script

With the test networks up an running, just run
```
npm run test
```