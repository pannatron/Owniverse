// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract OwniverseToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, ERC20PausableUpgradeable, OwnableUpgradeable {

    bool private _burnableEnabled;
    bool private _upgradeableEnabled;
    bool private _mintableEnabled;

    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address developerAddress,
        address userAddress,
        bool mintable,
        bool burnable,
        bool upgradeable
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __Ownable_init(msg.sender);
        __ERC20Burnable_init();
        __ERC20Pausable_init();

        require(developerAddress != address(0), "Developer address is required");
        require(userAddress != address(0), "User address is required");

        _mint(userAddress, initialSupply * 10 ** decimals());

        _mintableEnabled = mintable;
        _burnableEnabled = burnable;
        _upgradeableEnabled = upgradeable;
        transferOwnership(userAddress);

        if (!mintable) {
            renounceOwnership();
        }
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(_mintableEnabled, "Minting is disabled for this token");
        _mint(to, amount);
    }

    function burn(uint256 amount) public override {
        require(_burnableEnabled, "Burning is disabled for this token");
        super.burn(amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Override ฟังก์ชัน _update เพื่อให้ตรงกับการประกาศใน ERC20Upgradeable และ ERC20PausableUpgradeable
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        super._update(from, to, value);
    }

    // เพิ่มฟังก์ชันที่สามารถอัพเกรดได้ในอนาคต เช่น ฟีเจอร์เพิ่มเติม
    function futureFeature() public onlyOwner {
        // โค้ดสำหรับฟีเจอร์ในอนาคต
    }
}
