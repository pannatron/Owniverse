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
async function connectMetaMask() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // ตรวจสอบว่ามีการเชื่อมต่อแล้วหรือไม่
            if (window.ethereum.selectedAddress) {
                userAddress = window.ethereum.selectedAddress;
                console.log('Already connected:', userAddress);
                document.getElementById('userAddress').innerText = `Connected: ${userAddress}`;
            } else {
                // ขอการอนุญาตจากผู้ใช้
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                userAddress = accounts[0];
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
    const features = Array.from(document.getElementById('features').selectedOptions).map(opt => opt.value);
    
    // ดึงค่า initialSupply และ customSupply จากฟอร์ม
    let initialSupply = document.getElementById('initialSupply').value;
    if (initialSupply === 'custom') {
        initialSupply = document.getElementById('customSupply').value;
    }
    
    console.log("Creating Token with:", { tokenName, tokenSymbol, tokenLogo, features, initialSupply });

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

        await createTokenOnBackend(tokenName, tokenSymbol, tokenLogo, features, initialSupply, signature);

    } catch (error) {
        console.error("Error during token creation:", error);
        alert("Error during token creation: " + error.message);
    } finally {
        showLoading(false);
    }
};

// ส่งข้อมูลการสร้าง Token ไปยัง Backend
async function createTokenOnBackend(tokenName, tokenSymbol, tokenLogo, features, initialSupply, signature) {
    try {
        const response = await fetch('/api/createToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenName, tokenSymbol, tokenLogo, features, initialSupply, userAddress, signature })
        });

        const data = await response.json();
        console.log("Token created:", data);

        if (response.ok && data.tokenAddress) {
            // แสดงที่อยู่เหรียญบนหน้าเว็บเมื่อการสร้างสำเร็จ
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