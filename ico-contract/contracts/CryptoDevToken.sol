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

    //decide the market cap
    uint256 public marketCap = 10000 * 10**18;

    //min amount to purchase
    uint256 public constant minInvest = 0.005 ether; //5 token

    //we need to keep a track of tokenID which is getting claimed by the end users
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _ICryptoDevs) ERC20("Useless", "USE") {
        cryptoDevsNFT = ICryptoDevs(_ICryptoDevs);
    }

    //general public for those who dont have the NFT
    // @param _amount -> no fo token user want just like share as you decide how many you want to purchase
    function mint(uint256 _amountOfTokens) public payable {
        require(
            msg.value >= minInvest,
            "Minimum amount to invest for this token is 0.005 ETH"
        );
        //check for the moeny send is correct for that no of token
        require(
            msg.value == (tokenPrice * _amountOfTokens),
            "Please send the correct value"
        );

        //convert _amountOfTokens bignumber as mint() internal function takes it like that
        uint256 amountOfTokensBigInt = _amountOfTokens * 10**18;
        //call the totalSupply() internal function to know whats the current status of token got minted as we need to check with our max Supply
        require(
            totalSupply() + amountOfTokensBigInt <= marketCap,
            "No tokens in market"
        );

        //not mint the  tokens using _mint() internal functioon inside this standard function Transfer() gets called
        _mint(msg.sender, amountOfTokensBigInt);
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
            if (!tokenIdsClaimed[tokenId]) {
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
