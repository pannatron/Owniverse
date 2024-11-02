// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract OwniverseToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, Initializable {

    bool private _burnableEnabled;
    bool private _updatableEnabled; // ตัวแปรใหม่สำหรับเช็คว่าฟีเจอร์อัปเดตชื่อและสัญลักษณ์เปิดใช้งานหรือไม่
    string private _customName;
    string private _customSymbol;

    // ส่ง msg.sender เพื่อเป็นเจ้าของใน Ownable
    constructor() ERC20("Owniverse", "OWN") Ownable(msg.sender) {}

    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address developerAddress,
        address userAddress,
        bool mintable,
        bool burnable,
        bool updatable // เพิ่มพารามิเตอร์สำหรับกำหนดว่าอัปเดตชื่อและสัญลักษณ์ได้หรือไม่
    ) public initializer {
        require(developerAddress != address(0), "Developer address is required");
        require(userAddress != address(0), "User address is required");
        require(bytes(name_).length > 0, "Token name is required");
        require(bytes(symbol_).length > 0, "Token symbol is required");

        // Mint initial supply directly to the user
        _mint(userAddress, initialSupply * 10 ** decimals());

        _customName = name_;
        _customSymbol = symbol_;

        _burnableEnabled = burnable;
        _updatableEnabled = updatable; // กำหนดค่าเริ่มต้นของตัวแปรเช็ค
        transferOwnership(userAddress);

        if (!mintable) {
            renounceOwnership();
        }
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public override {
        require(_burnableEnabled, "Burning is disabled for this token");
        super.burn(amount);
    }

    function updateTokenDetails(string memory newName, string memory newSymbol) public onlyOwner {
        require(_updatableEnabled, "Updating token details is disabled");
        require(bytes(newName).length > 0, "New token name is required");
        require(bytes(newSymbol).length > 0, "New token symbol is required");
        _customName = newName;
        _customSymbol = newSymbol;
    }

    function name() public view override returns (string memory) {
        return _customName;
    }

    function symbol() public view override returns (string memory) {
        return _customSymbol;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
