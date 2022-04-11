// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ICryptoDevs.sol";

//creating token for the ICO
contract CryptoDevToken is ERC20 {
    ICryptoDevs cryptoDevsNFT;

    //price of one Token
    uint256 public constant tokenPrice = 0.001 ether;
    //token/NFT
    //erc20 tokens represented in form of bignumber and start with smallest denomiantion of 10^-18
    // tokensPerNFT = 1 means you hold 10^-18
    //as _mint() internal function of ERC20 expects the big number `
    //so convert it to big number
    uint256 public constant tokensPerNFT = 10 * 10**18;

    //we need to keep a track of tokenID which is getting claimed by the end users
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _ICryptoDevs) ERC20("Useless", "USE") {
        cryptoDevsNFT = ICryptoDevs(_ICryptoDevs);
    }

    //if i am the user and i have 2 nft i will claim the token in a name of that 2 nft
    function claim() public {
        //TODO1 check the balance of the sender wheher he has nft or not
        uint256 ownedNFT = cryptoDevsNFT.balanceOf(msg.sender);
        require(
            ownedNFT > 0,
            "You should have atleast one Crypto Dev NFT to claim the token"
        );

        //we have 20 NFT deployed for cryptoDevs
        //assume owner1 owns nft at nth index
        //so only possible way is to loop over it and take out tokenID
        uint256 amount = 0;
        for (uint256 i = 0; i < ownedNFT; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (!tokenIdsClaimed) {
                // if not , then user will be able to claim
                // claim all token
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }

        require(amount > 0, "You have already claimed all tokens!");

        //call the erc20 internal function
        _mint(msg.sender, amount * tokensPerNFT);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
