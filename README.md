# Owniverse

OWNiverse is designed to bridge the gap between everyday users and the world of Web3, allowing anyone to easily create and own their own token or project. Our platform makes blockchain innovation accessible to everyone by enabling payments through local banking systems, offering a familiar and convenient process for users.

## Prerequisites

Before starting the project, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) - You can check if you have it by running `npm -v` in your terminal
- **MetaMask Wallet** - Used for connecting and signing blockchain transactions

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/pannatron/Owniverse.git

2. Navigate to the project directory:
```bash
cd Owniverse
```
3.Create a .env file in the root of the project and fill in the following details:
```bash

PRIVATE_KEY=your_deployer_private_key_here
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
RPC_URL=https://rpc-testnet.bitkubchain.io
CHAIN_ID=25925
```
4.Create a  `package.json ` File (if not already present): Ensure your project has a  `package.json ` by running:
```bash

npm init -y
```
5.Install Hardhat: Install Hardhat as a development dependency:
```bash

npm install --save-dev hardhat
```
6.Install Hardhat Waffle and Ethers: Add the Hardhat plugins needed for contract development:
```bash

npm install --save-dev @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers ethers
```
7.Install OpenZeppelin Contracts: This is necessary for importing contract templates:
```bash

npm install @openzeppelin/contracts @openzeppelin/contracts-upgradeable

```
8.Navigate to the backend directory and install additional dependencies:
```bash

cd backend
npm install express body-parser web3@1.7.0 ethers dotenv
npm install --save-dev hardhat
npm install --save-dev @nomiclabs/hardhat-waffle
npm install --save-dev @nomiclabs/hardhat-ethers ethers

```

9.Compile the smart contracts using Hardhat:

```bash
npx hardhat compile

```
This will generate the `artifacts` folder and the necessary `OwniverseToken.json` file that you'll need for deployment.



# Running the Project
## Running the Backend
1. Navigate to the backend folder if you're not already there:
```bash

cd backend
```
2. Start the backend server:
```bash
node -r esm server.js
```

The backend server will be running on port `3000`.


## Frontend Setup
1. Navigate to the frontend directory:
```bash

cd frontend
```
2. Install dependencies for the frontend (if needed):
```bash

npm install
```
3. Start the frontend application (this will depend on the framework used, such as React, Angular, etc.):

For example, if you're using React, run:
```bash

npm start
```

## Testing APIs
You can test the backend API using tools like Postman or curl.
```bash

Example for creating a token:
curl -X POST http://localhost:3000/api/createToken \
-H "Content-Type: application/json" \
-d '{
  "tokenName": "MyToken",
  "tokenSymbol": "MTK",
  "tokenLogo": "https://example.com/logo.png",
  "features": ["mintable", "burnable"],
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
}'
```

Example for sending a transaction:
```bash

curl -X POST http://localhost:3000/api/sendTransaction \
-H "Content-Type: application/json" \
-d '{
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "signature": "0x...",
  "message": "I authorize this transaction"
}'
```

## Contributing
Contributions are welcome! If you'd like to contribute, please fork the repository and make your changes in a separate branch. Submit a pull request once your changes are ready.

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

``` bash
project-root/
│
├── contracts/
│   └── BOROTToken.sol     # Smart contract ของเหรียญ (ERC20) ที่รองรับฟีเจอร์เพิ่มเติม
│
├── scripts/
│   └── deploy.js          # สคริปต์ที่ใช้ deploy smart contract โดยใช้ Hardhat
│
├── frontend/
│   ├── index.html         # หน้าเว็บไซต์หลักสำหรับให้ผู้ใช้เลือกฟีเจอร์เหรียญ
│   ├── style.css          # ไฟล์ CSS สำหรับจัดการหน้าตาเว็บไซต์
│   └── app.js             # JavaScript ฝั่ง frontend สำหรับเชื่อมต่อกับ MetaMask และ backend
│
├── backend/
│   ├── server.js          # ระบบ backend ที่เชื่อมต่อกับ Biconomy หรือ GSN และ Hardhat
│   └── package.json       # ไฟล์สำหรับจัดการ dependencies ของ backend (Node.js)
│
├── hardhat.config.js       # การตั้งค่า Hardhat สำหรับการ deploy smart contract
├── .env                    # เก็บ environment variables เช่น private key และ API keys
└── README.md               # คู่มือการใช้งานโปรเจค

``` 

## Testing APIs
Note: These APIs are designed to work with the Bitkub Chain Testnet.
