const { ethers } = require("hardhat");

async function main() {
    // รับค่าจาก command line arguments
    const tokenName = process.argv[2];
    const tokenSymbol = process.argv[3];
    const userAddress = process.argv[4];

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Token = await ethers.getContractFactory("BOROTToken");

    // ค่าเริ่มต้น
    const initialSupply = 1000000;    // จำนวนเหรียญ
    const mintable = true;  // ขึ้นอยู่กับที่ผู้ใช้เลือก
    const burnable = true;  // ขึ้นอยู่กับที่ผู้ใช้เลือก
    const pausable = true;  // ขึ้นอยู่กับที่ผู้ใช้เลือก

    // Deploy contract
    const token = await Token.deploy();
    await token.initialize(tokenName, tokenSymbol, initialSupply, userAddress, mintable, burnable, pausable);

    console.log("Token deployed to:", token.address);
}

// ตรวจสอบว่า script ถูกเรียกด้วย arguments ที่ถูกต้อง
if (process.argv.length !== 5) {
    console.error("Usage: npx hardhat run <script> <tokenName> <tokenSymbol> <userAddress>");
    process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
