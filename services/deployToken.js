const { ethers } = require("ethers");
const UpgradeableContractArtifact = require('../artifacts/contracts/UpgradeableToken.sol/OwniverseToken.json');
const NonUpgradeableContractArtifact = require('../artifacts/contracts/NonUpgradeableToken.sol/OwniverseToken.json');

async function deployTokenContract(
    tokenName,
    tokenSymbol,
    features,
    initialSupply,
    userAddress,
    contractType,
    provider,
    relayerPrivateKey,
    developerAddress
) {
    if (!relayerPrivateKey) {
        throw new Error('Relayer private key is undefined.');
    }

    if (!tokenName || !tokenSymbol || !userAddress || !initialSupply) {
        throw new Error('Invalid input data: missing tokenName, tokenSymbol, initialSupply, or userAddress.');
    }

    if (!ethers.utils.isAddress(userAddress)) {
        throw new Error('Invalid Ethereum address.');
    }

    console.log('Deploying Token with:', { tokenName, tokenSymbol, initialSupply, userAddress, contractType });

    const signer = new ethers.Wallet(relayerPrivateKey, provider);
    let TokenFactory, token;

    // เลือก contract artifact ตาม contractType
    const contractArtifact = contractType === 'upgradeable' ? UpgradeableContractArtifact : NonUpgradeableContractArtifact;
    TokenFactory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, signer);

    // Deploy contract
    token = await TokenFactory.deploy();
    await token.deployed();
    console.log(`${contractType === 'upgradeable' ? 'Upgradeable' : 'Non-Upgradeable'} Token deployed at: ${token.address}`);

    try {
        // Estimate gas for initialization
        const estimatedGas = await token.estimateGas.initialize(
            tokenName,
            tokenSymbol,
            initialSupply,
            developerAddress,
            userAddress,
            features.includes('mintable'),
            features.includes('burnable'),
            features.includes('pausable'),
            features.includes('renameable'),
        );

        // เพิ่มค่า gas ไปอีก 20%
        const gasLimitWithBuffer = estimatedGas.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100));

        // Initialize contract
        await token.initialize(
            tokenName,
            tokenSymbol,
            initialSupply,
            developerAddress,
            userAddress,
            features.includes('mintable'),
            features.includes('burnable'),
            features.includes('pausable'),
            features.includes('renameable'),
            { gasLimit: gasLimitWithBuffer }
        );

        console.log('Contract initialized successfully');
    } catch (error) {
        console.error('Error initializing contract:', error);
        throw error;
    }

    return token.address;
}

module.exports = { deployTokenContract };
