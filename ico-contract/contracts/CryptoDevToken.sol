// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20 {
    // Price of one Crypto Dev token
    uint256 public constant tokenPrice = 0.001 ether;
    // Each NFT would give the user 10 tokens
    // It needs to be represented as 10 * (10 ** 18) as ERC20 tokens are represented by the smallest denomination possible for the token
    // By default, ERC20 tokens have the smallest denomination of 10^(-18). This means, having a balance of (1)
    // is actually equal to (10 ^ -18) tokens.
    // Owning 1 full token is equivalent to owning (10^18) tokens when you account for the decimal places.
    // More information on this can be found in the Freshman Track Cryptocurrency tutorial.
    uint256 public constant tokensPerNFT = 10 * 10**18;
    // the max total supply is 10000 for Crypto Dev Tokens
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    // CryptoDevsNFT contract instance
    ICryptoDevs CryptoDevsNFT;
    // Mapping to keep track of which tokenIds have been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    /**
     * @dev Mints `amount` number of CryptoDevTokens
     * Requirements:
     * - `msg.value` should be equal or greater than the tokenPrice * amount
     */
    function mint(uint256 amount) public payable {
        // the value of ether that should be equal or greater than tokenPrice * amount;
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");
        // total tokens + amount <= 10000, otherwise revert the transaction
        uint256 amountWithDecimals = amount * 10**18;
        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceeds the max total supply available."
        );
        // call the internal function from Openzeppelin's ERC20 contract
        _mint(msg.sender, amountWithDecimals);
    }

    /**
     * @dev Mints tokens based on the number of NFT's held by the sender
     * Requirements:
     * balance of Crypto Dev NFT's owned by the sender should be greater than 0
     * Tokens should have not been claimed for all the NFTs owned by the sender
     */
    function claim() public {
        address sender = msg.sender;
        // Get the number of CryptoDev NFT's held by a given sender address
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        // If the balance is zero, revert the transaction
        require(balance > 0, "You dont own any Crypto Dev NFT's");
        // amount keeps track of number of unclaimed tokenIds
        uint256 amount = 0;
        // loop over the balance and get the token ID owned by `sender` at a given `index` of its token list.
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
            // if the tokenId has not been claimed, increase the amount
            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        // If all the token Ids have been claimed, revert the transaction;
        require(amount > 0, "You have already claimed all the tokens");
        // call the internal function from Openzeppelin's ERC20 contract
        // Mint (amount * 10) tokens for each NFT
        _mint(msg.sender, amount * tokensPerNFT);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}

//creating token for the ICO
// contract CryptoDevToken is ERC20 {
//     ICryptoDevs cryptoDevsNFT;

//     //price of one Token
//     uint256 public constant tokenPrice = 0.001 ether;
//     //token/NFT
//     //erc20 tokens represented in form of bignumber and start with smallest denomiantion of 10^-18
//     // tokensPerNFT = 1 means you hold 10^-18
//     //as _mint() internal function of ERC20 expects the big number `
//     //so convert it to big number
//     uint256 public constant tokensPerNFT = 10 * 10**18;

//     //decide the market cap
//     uint256 public marketCap = 10000 * 10**18;

//     //min amount to purchase
//     uint256 public constant minInvest = 0.005 ether; //5 token

//     //we need to keep a track of tokenID which is getting claimed by the end users
//     mapping(uint256 => bool) public tokenIdsClaimed;

//     constructor(address _ICryptoDevs) ERC20("Useless", "USE") {
//         cryptoDevsNFT = ICryptoDevs(_ICryptoDevs);
//     }

//     //general public for those who dont have the NFT
//     // @param _amount -> no fo token user want just like share as you decide how many you want to purchase
//     function mint(uint256 _amountOfTokens) public payable {
//         require(
//             msg.value >= minInvest,
//             "Minimum amount to invest for this token is 0.005 ETH"
//         );
//         //check for the moeny send is correct for that no of token
//         require(
//             msg.value >= (tokenPrice * _amountOfTokens),
//             "Please send the correct value"
//         );

//         //convert _amountOfTokens bignumber as mint() internal function takes it like that
//         uint256 amountOfTokensBigInt = _amountOfTokens * 10**18;
//         //call the totalSupply() internal function to know whats the current status of token got minted as we need to check with our max Supply
//         require(
//             totalSupply() + amountOfTokensBigInt <= marketCap,
//             "No tokens in market"
//         );

//         //not mint the  tokens using _mint() internal functioon inside this standard function Transfer() gets called
//         _mint(msg.sender, amountOfTokensBigInt);
//     }

//     //if i am the user and i have 2 nft i will claim the token in a name of that 2 nft
//     function claim() public {
//         //TODO1 check the balance of the sender wheher he has nft or not
//         uint256 ownedNFT = cryptoDevsNFT.balanceOf(msg.sender);
//         require(
//             ownedNFT > 0,
//             "You should have atleast one Crypto Dev NFT to claim the token"
//         );

//         //we have 20 NFT deployed for cryptoDevs
//         //assume owner1 owns nft at nth index
//         //so only possible way is to loop over it and take out tokenID
//         uint256 amount = 0;
//         for (uint256 i = 0; i < ownedNFT; i++) {
//             uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
//             if (!tokenIdsClaimed[tokenId]) {
//                 // if not , then user will be able to claim
//                 // claim all token
//                 amount += 1;
//                 tokenIdsClaimed[tokenId] = true;
//             }
//         }

//         require(amount > 0, "You have already claimed all tokens!");

//         //call the erc20 internal function
//         _mint(msg.sender, amount * tokensPerNFT);
//     }

//     // Function to receive Ether. msg.data must be empty
//     receive() external payable {}

//     // Fallback function is called when msg.data is not empty
//     fallback() external payable {}
// }
