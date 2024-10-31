const { ethers } = require("ethers");

const contractArtifact = require('../artifacts/contracts/Token.sol/OwniverseToken.json');


async function deployTokenContract(tokenName, tokenSymbol, features, userAddress, provider, relayerPrivateKey, developerAddress) {
    
    if (!relayerPrivateKey) {
        throw new Error('Relayer private key is undefined.');
    }

    if (!tokenName || !tokenSymbol || !userAddress) {
        throw new Error('Invalid input data: missing tokenName, tokenSymbol, or userAddress.');
    }

    if (!ethers.utils.isAddress(userAddress)) {
        throw new Error('Invalid Ethereum address.');
    }

    console.log('Deploying Token with:', { tokenName, tokenSymbol, userAddress });

    const signer = new ethers.Wallet(relayerPrivateKey, provider);

    const TokenFactory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, signer);
    const token = await TokenFactory.deploy();
    await token.deployed();
    console.log(`Token deployed at: ${token.address}`);

    await token.initialize(
        tokenName,
        tokenSymbol,
        1000000,
        developerAddress,
        userAddress,
        features.includes('mintable'),
        features.includes('burnable'),
        features.includes('upgradeable'),
        { gasLimit: 10000000 }
    );

    return token.address;
}

module.exports = { deployTokenContract };
