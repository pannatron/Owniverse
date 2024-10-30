const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // เพิ่มโมดูล path
const { ethers } = require("ethers");
const Web3 = require('web3');
const contractArtifact = require('../artifacts/contracts/Token.sol/OwniverseToken.json');
const ABI = contractArtifact.abi; 

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(bodyParser.json());

// ใช้ HttpProvider เพื่อเชื่อมต่อกับ RPC URL
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));  // ใช้ URL จาก .env

// เสิร์ฟไฟล์ static จากโฟลเดอร์ frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// เสิร์ฟหน้าแรก (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// API สำหรับการสร้างโทเคน
app.post('/api/createToken', async (req, res) => {
    const { tokenName, tokenSymbol, tokenLogo, features, userAddress } = req.body;

    try {
        const tokenAddress = await deployTokenContract(tokenName, tokenSymbol, features, userAddress);
        res.json({ tokenAddress });
    } catch (error) {
        console.error('Error deploying token:', error);
        res.status(500).json({ error: 'Failed to create token' });
    }
});

async function deployTokenContract(tokenName, tokenSymbol, features, userAddress) {
    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!relayerPrivateKey) {
        throw new Error('Relayer private key is undefined.');
    }
    console.log('Relayer Private Key:', relayerPrivateKey);

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(relayerPrivateKey, provider);

    console.log('RPC URL:', process.env.RPC_URL);

    const TokenFactory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, signer);
    const token = await TokenFactory.deploy();
    await token.initialize(tokenName, tokenSymbol, 1000000, userAddress, 
        features.includes('mintable'), features.includes('burnable'), features.includes('upgradeable'));

    await token.deployed();
    console.log(`Token deployed at: ${token.address}`);
    return token.address;
}

// API สำหรับการสร้างโทเคน
app.post('/api/createToken', async (req, res) => {
    const { tokenName, tokenSymbol, tokenLogo, features, userAddress } = req.body;

    try {
        const tokenAddress = await deployTokenContract(tokenName, tokenSymbol, features, userAddress);
        res.json({ tokenAddress }); // ส่งคืนที่อยู่ของโทเคนไปยัง frontend
    } catch (error) {
        console.error('Error deploying token:', error);
        res.status(500).json({ error: 'Failed to create token' });
    }
});

// API สำหรับส่งธุรกรรม
app.post('/api/sendTransaction', async (req, res) => {
    const { userAddress, signature, message, tokenAddress } = req.body; // รับ tokenAddress

    const signer = web3.eth.accounts.recover(message, signature);
    if (signer.toLowerCase() !== userAddress.toLowerCase()) {
        return res.status(400).send('Invalid signature');
    }

    // ใช้ tokenAddress ที่ส่งมาจาก frontend
    const contract = new web3.eth.Contract(ABI, tokenAddress); // ใช้ tokenAddress แทน 'contract_address'
    const transactionData = contract.methods.mint(userAddress, 1000).encodeABI();

    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const signedTx = await web3.eth.accounts.signTransaction({
        to: tokenAddress,
        data: transactionData,
        gas: 2000000,
        gasPrice: web3.utils.toWei('50', 'gwei') // เพิ่ม gas price ที่สูงขึ้น
    }, relayerPrivateKey);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction,{timeout: 10000})
        .on('receipt', (receipt) => {
            console.log('Transaction successful:', receipt);
            res.status(200).send('Transaction sent');
        })
        .on('error', (error) => {
            console.error('Error sending transaction:', error);
            res.status(500).send('Transaction failed');
        });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
