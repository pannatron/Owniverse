// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract BOROTToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, Initializable {
    
    constructor() ERC20("BOROT", "BOR") {}

    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address owner_,
        bool mintable,
        bool burnable,
        bool pausable
    ) public initializer {
        _name = name_;
        _symbol = symbol_;
        _mint(owner_, initialSupply * 10 ** decimals());
        transferOwnership(owner_);  // โอนสิทธิ์ให้ลูกค้า

        if (!mintable) {
            renounceOwnership(); // หากไม่ต้องการ mint เพิ่มเติม
        }
    }

    function pause() public onlyOwner {
        require(pausable, "Token is not pausable");
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
