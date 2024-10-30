let web3;
let userAddress;

// เชื่อมต่อ MetaMask
async function connectMetaMask() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            console.log('Connected:', userAddress);

            // แสดงที่อยู่ที่เชื่อมต่อ
            document.getElementById('userAddress').innerText = `Connected: ${userAddress}`;
            document.getElementById('mintButton').disabled = false; // เปิดใช้งานปุ่ม Mint

        } catch (error) {
            console.error('User rejected the request');
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
    console.log("Creating Token with:", { tokenName, tokenSymbol, tokenLogo, features });

    await createTokenOnBackend(tokenName, tokenSymbol, tokenLogo, features);
};

// ส่งข้อมูลการสร้าง Token ไปยัง Backend
async function createTokenOnBackend(tokenName, tokenSymbol, tokenLogo, features) {
    try {
        const response = await fetch('/api/createToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenName, tokenSymbol, tokenLogo, features, userAddress })
        });
        const data = await response.json();
        console.log("Token created:", data);
        
        // ส่ง tokenAddress ไปยังฟังก์ชัน signTransaction
        await signTransaction(data.tokenAddress);
    } catch (error) {
        console.error("Error creating token:", error);
    }
}

// ฟังก์ชัน Mint เหรียญเพิ่มเติม
async function mintMoreTokens() {
    if (!userAddress) {
        alert('Please connect MetaMask first.');
        return;
    }
    console.log('Minting more tokens...');
    // ส่งคำขอ Mint ไปยัง backend หรือสัญญาอัจฉริยะ
}

// ฟังก์ชันเซ็นลายเซ็น (Sign a message)
async function signTransaction(tokenAddress) {
    if (!userAddress) {
        alert('Please connect MetaMask first.');
        return;
    }
    
    const message = "I authorize this transaction";
    const signature = await web3.eth.personal.sign(message, userAddress);

    // ส่งลายเซ็นและข้อมูลไปให้ backend (Relayer)
    await fetch('/api/sendTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress, signature, message, tokenAddress }) // ส่ง tokenAddress ด้วย
    });
}
