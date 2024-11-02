let web3;
let userAddress;

// ฟังก์ชันสำหรับแสดงสถานะการโหลด
function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (isLoading) {
        loadingIndicator.style.display = 'block';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

// เชื่อมต่อ MetaMask
// เชื่อมต่อ MetaMask
async function connectMetaMask() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // ขอการอนุญาตจากผู้ใช้และตรวจสอบว่ามีบัญชีที่เชื่อมต่อหรือไม่
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            
            if (accounts.length > 0) {
                // หากมีบัญชีที่เชื่อมต่ออยู่แล้ว
                userAddress = accounts[0];
                console.log('Already connected:', userAddress);
                document.getElementById('userAddress').innerText = `Connected: ${userAddress}`;
            } else {
                // ขอการเชื่อมต่อจากผู้ใช้
                const newAccounts = await ethereum.request({ method: 'eth_requestAccounts' });
                userAddress = newAccounts[0];
                console.log('Connected:', userAddress);
                document.getElementById('userAddress').innerText = `Connected: ${userAddress}`;
            }
        } catch (error) {
            if (error.code === 4001) {
                // ผู้ใช้ปฏิเสธการขออนุญาต
                console.error('User rejected the request');
                alert('Connection rejected by user.');
            } else {
                console.error('Error connecting to MetaMask:', error);
            }
        }
    } else {
        alert('MetaMask not detected');
    }
}


// สร้างโทเคนใหม่
document.getElementById('tokenForm').onsubmit = async function (e) {
    e.preventDefault();
    const tokenName = document.getElementById('tokenName').value;
    const tokenSymbol = document.getElementById('tokenSymbol').value;
    const tokenLogo = document.getElementById('tokenLogo').value;
    const features = Array.from(document.querySelectorAll('input[name="feature"]:checked')).map(checkbox => checkbox.value);
    // ดึงค่า contractType จากฟอร์ม
    const contractType = document.querySelector('input[name="contractType"]:checked').value;
    
    // ดึงค่า initialSupply และ customSupply จากฟอร์ม
    let initialSupply = document.getElementById('initialSupply').value;
    if (initialSupply === 'custom') {
        initialSupply = document.getElementById('customSupply').value;
    }
    
    console.log("Creating Token with:", { tokenName, tokenSymbol, tokenLogo, features, initialSupply, contractType });

    if (!userAddress) {
        alert('Please connect MetaMask first.');
        return;
    }

    try {
        // แสดงสถานะการโหลด
        showLoading(true);

        // เซ็นลายเซ็นก่อนสร้างโทเคน
        const message = "I authorize the creation of this token";
        const signature = await web3.eth.personal.sign(message, userAddress);
        console.log("Signature:", signature);

        // ส่งข้อมูลไปยัง backend พร้อมประเภท contract
        await createTokenOnBackend(tokenName, tokenSymbol, tokenLogo, features, initialSupply, signature, contractType);

    } catch (error) {
        console.error("Error during token creation:", error);
        alert("Error during token creation: " + error.message);
    } finally {
        showLoading(false);
    }
};

// ส่งข้อมูลไปยัง backend พร้อมข้อมูลประเภท contract
async function createTokenOnBackend(tokenName, tokenSymbol, tokenLogo, features, initialSupply, signature, contractType) {
    try {
        const response = await fetch('/api/createToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenName, tokenSymbol, tokenLogo, features, initialSupply, userAddress, signature, contractType })
        });

        const data = await response.json();
        console.log("Token created:", data);

        if (response.ok && data.tokenAddress) {
            const tokenLink = `https://testnet.bkcscan.com/address/${data.tokenAddress}`;
            document.getElementById('tokenAddress').innerHTML = 
                `Token created successfully! Address: <a href="${tokenLink}" target="_blank">${data.tokenAddress}</a>`;
        } else {
            throw new Error("Token creation failed: " + (data.error || "Unknown error"));
        }

    } catch (error) {
        console.error("Error creating token:", error);
        alert("Error creating token: " + error.message);
    }
}

// ฟังก์ชันสำหรับ Mint Token
async function mintTokens() {
    const contractAddress = document.getElementById('contractAddress').value;
    const mintAmount = document.getElementById('mintAmount').value;

    if (!userAddress || !web3) {
        alert('Please connect MetaMask first.');
        return;
    }

    if (!contractAddress || !mintAmount) {
        alert('Please enter contract address and amount to mint.');
        return;
    }

    try {
        showLoading(true);

        const message = `I authorize minting ${mintAmount} tokens to ${contractAddress}`;
        const signature = await web3.eth.personal.sign(message, userAddress);

        const response = await fetch('/api/mintToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractAddress, mintAmount, userAddress, signature })
        });

        const data = await response.json();
        console.log("Mint result:", data);

        if (response.ok) {
            alert(`Minted ${mintAmount} tokens successfully!`);
        } else {
            throw new Error(data.error || 'Minting failed');
        }
    } catch (error) {
        console.error("Error minting tokens:", error);
        alert("Error minting tokens: " + error.message);
    } finally {
        showLoading(false);
    }
}

// ฟังก์ชันสำหรับ Burn Token
async function burnTokens() {
    const contractAddress = document.getElementById('contractAddress').value;
    const burnAmount = document.getElementById('burnAmount').value;

    if (!userAddress || !web3) {
        alert('Please connect MetaMask first.');
        return;
    }

    if (!contractAddress || !burnAmount) {
        alert('Please enter contract address and amount to burn.');
        return;
    }

    try {
        showLoading(true);

        const message = `I authorize burning ${burnAmount} tokens from ${contractAddress}`;
        const signature = await web3.eth.personal.sign(message, userAddress);

        const response = await fetch('/api/burnToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractAddress, burnAmount, userAddress, signature })
        });

        const data = await response.json();
        console.log("Burn result:", data);

        if (response.ok) {
            alert(`Burned ${burnAmount} tokens successfully!`);
        } else {
            throw new Error(data.error || 'Burning failed');
        }
    } catch (error) {
        console.error("Error burning tokens:", error);
        alert("Error burning tokens: " + error.message);
    } finally {
        showLoading(false);
    }
}

// ฟังก์ชันสำหรับอัปเดตชื่อและสัญลักษณ์ Token
async function updateTokenDetails() {
    const contractAddress = document.getElementById('contractAddress').value;
    const newTokenName = document.getElementById('newTokenName').value;
    const newTokenSymbol = document.getElementById('newTokenSymbol').value;

    if (!userAddress || !web3) {
        alert('Please connect MetaMask first.');
        return;
    }

    if (!contractAddress || !newTokenName || !newTokenSymbol) {
        alert('Please enter contract address, new token name, and new token symbol.');
        return;
    }

    try {
        showLoading(true);

        const message = `I authorize updating token details for ${contractAddress}`;
        const signature = await web3.eth.personal.sign(message, userAddress);

        const response = await fetch('/api/updateTokenDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractAddress, newTokenName, newTokenSymbol, userAddress, signature })
        });

        const data = await response.json();
        console.log("Update result:", data);

        if (response.ok) {
            alert(`Token details updated successfully!`);
        } else {
            throw new Error(data.error || 'Update failed');
        }
    } catch (error) {
        console.error("Error updating token details:", error);
        alert("Error updating token details: " + error.message);
    } finally {
        showLoading(false);
    }
}
