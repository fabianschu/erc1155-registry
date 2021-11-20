//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Strings.sol";

import "hardhat/console.sol";

struct TokenTier {
    uint128 uriId;
    bool transferable;
    uint16 tokenSupply;
    uint16 allTiersIndex;
}

contract Registry is Ownable, ERC1155 {
    using Strings for string;
    using Strings for uint128;

    // tokenId => TokenTier
    mapping(uint256 => TokenTier) private _tokenTiers;

    uint256[] private _allTiers;

    constructor(string memory _newBaseUri) ERC1155(_newBaseUri) {}

    /*
        Minting & burning
    */

    function mint(address account, uint256 id, uint256 amount, bytes memory data) external onlyOwner{
        require(_tokenTiers[id].uriId != 0, "Tier does not exist");

        _mint(account, id, amount, data);
    }

    /*
        Transferring
    */

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

    /*
        Configuration
    */

    function setBaseUri(
        string memory _newBaseUri
    ) public onlyOwner {
        _setURI(_newBaseUri);
    }

    function createTokenTier(uint256 tokenId, uint128 uriId, bool transferable) public {
        _tokenTiers[tokenId] = TokenTier(
            uriId, transferable, 0, uint16(_allTiers.length)
        );
    }

    /*
        Queries
    */

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        string memory baseUri = super.uri(tokenId);
        string memory uriId = _tokenTiers[tokenId].uriId.uint2str();
        return baseUri.append(uriId);
    }
}
