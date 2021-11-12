//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable, ERC1155 {

    mapping(uint256 => uint256) private metaUris;

    constructor(string memory _newBaseUri) ERC1155(_newBaseUri) {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data) external onlyOwner{
        // 

        _mint(account, id, amount, data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override onlyOwner {
        _safeTransferFrom(
            from,
            to,
            id,
            amount,
            data
         );
    }

    function setBaseUri(
        string memory _newBaseUri
    ) public onlyOwner {
        _setURI(_newBaseUri);
    }

    function uri(uint256) public view override returns (string memory) {
        return _uri;
    }
}
