const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { ethers } = require("ethers");
const Web3 = require('web3');
const contractArtifact = require('../artifacts/contracts/Token.sol/OwniverseToken.json');
const ABI = contractArtifact.abi;

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(bodyParser.json());

// Connect to RPC URL
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

async function deployTokenContract(tokenName, tokenSymbol, features, userAddress) {
    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const developerAddress = process.env.DEV_PUBLIC_KEY;

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

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(relayerPrivateKey, provider);

    const TokenFactory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, signer);
    console.log('Relayer Private Key:', relayerPrivateKey);
    console.log('Provider URL:', process.env.RPC_URL);
    console.log('ABI:', ABI);
    console.log('Contract deployment inputs:', { tokenName, tokenSymbol, userAddress, features });

    // Deploy contract and initialize
    const token = await TokenFactory.deploy();
    await token.deployed();
    console.log(`Token deployed at: ${token.address}`);
    console.log('Initializing contract with:', {
        tokenName, 
        tokenSymbol, 
        initialSupply: 1000000, 
        developerAddress, 
        userAddress,
        mintable: features.includes('mintable'), 
        burnable: features.includes('burnable'), 
        upgradeable: features.includes('upgradeable')
    });
    
    // Initialize contract
    await token.initialize(
        tokenName, 
        tokenSymbol, 
        1000000, 
        developerAddress, 
        userAddress, // เพิ่ม userAddress เข้าไป
        features.includes('mintable'), 
        features.includes('burnable'), 
        features.includes('upgradeable'),
        { gasLimit: 5000000 } // ตั้งค่า gas limit

    );
    
    return token.address;
}

app.post('/api/createToken', async (req, res) => {
    const { tokenName, tokenSymbol, features, userAddress } = req.body;

    try {
        console.log('Creating token with:', { tokenName, tokenSymbol, features, userAddress });
        const tokenAddress = await deployTokenContract(tokenName, tokenSymbol, features, userAddress);
        res.json({ tokenAddress, message: `Token deployed successfully at address: ${tokenAddress}` });
    } catch (error) {
        console.error('Error deploying token:', error);
        res.status(500).json({ error: 'Failed to create token', details: error.message });
    }
});

app.post('/api/sendTransaction', async (req, res) => {
    const { userAddress, signature, message, tokenAddress } = req.body;

    if (!userAddress || !signature || !message || !tokenAddress) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    if (!ethers.utils.isAddress(userAddress) || !ethers.utils.isAddress(tokenAddress)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const signer = web3.eth.accounts.recover(message, signature);
    if (signer.toLowerCase() !== userAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const contract = new web3.eth.Contract(ABI, tokenAddress);
    const transactionData = contract.methods.mint(userAddress, 1000).encodeABI();

    try {
        const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
        const signedTx = await web3.eth.accounts.signTransaction({
            to: tokenAddress,
            data: transactionData,
            gas: 10000000,
            gasPrice: web3.utils.toWei('50', 'gwei')
        }, relayerPrivateKey);

        web3.eth.sendSignedTransaction(signedTx.rawTransaction, { timeout: 10000 })
            .on('receipt', (receipt) => {
                console.log('Transaction successful:', receipt);
                res.status(200).json({ message: 'Transaction sent', receipt });
            })
            .on('error', (error) => {
                console.error('Error sending transaction:', error);
                res.status(500).json({ error: 'Transaction failed', details: error.message });
            });
    } catch (error) {
        console.error('Error signing transaction:', error);
        res.status(500).json({ error: 'Error signing transaction', details: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
