// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// to check for owners of CryptoDev NFT's.

interface ICryptoDevs {
    //as the vryptodev nft inherit the erc721 so we have the function
    //tokenOfOwnerByIndex(address owner, uint256 index) → uint256 tokenId
    //Returns a token ID owned by `owner` at a given `index` of its token list.
    // tokenOfOwnerByIndex( ox04545... , index=2 ){ index< [4]balanceOf(owner) }
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256 tokenId);

    //returns the no of tokens owned by any address
    function balanceOf(address _owner) external view returns (uint256 balance);
}
