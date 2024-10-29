require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    bitkub_testnet: {
      url: "https://rpc-testnet.bitkubchain.io",
      chainId: 25925,
      accounts: [process.env.PRIVATE_KEY],
    },
  }
};
