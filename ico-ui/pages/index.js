import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { ethers, BigNumber } from "ethers";
import coverImage from "../public/cover.svg";
import { ICOContractAddress, ICOabi } from "../constants/icoVariable";
import { NFTContarctAddress, NFTabi } from "../constants/nftVariable";
import ProgressBar from "@badrap/bar-of-progress";

export default function Home() {
  const zero = BigNumber.from(0);
  const [overallToken, setOverallToken] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [balanceOfCDToken, setBalanceOfCDToken] = useState(0);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);
  const [{ data }, disconnect] = useAccount();
  const [
    {
      data: { connected, connectors },
    },
    connect,
  ] = useConnect();

  const progress = new ProgressBar({
    size: 3,
    color: "#FE595E",
    className: "z-50",
    delay: 1200,
  });

  //Todo 1. get the no of token overall minted - totalSupply()  internal function erc20
  const getOverallTokensMinted = async () => {
    if (connected) {
      try {
        const provider = await getProviderOrSigner();
        //get the count of the token minted - ICO Contract
        const icoContract = new ethers.Contract(
          ICOContractAddress,
          ICOabi,
          provider
        );
        const _overallTokenMinted = await icoContract.totalSupply();

        const convertIntOverallToken = parseInt(
          ethers.utils.formatEther(_overallTokenMinted)
        );
        // console.log("overrallvalue", convertIntOverallToken);
        setOverallToken(convertIntOverallToken);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.warn("waiting to setup conncntn");
    }
  };

  //Todo 2. get the no of token minted by user till now using -- balanceOf(address account)
  const getBalanceOfCryptoDevTokens = async () => {
    try {
      if (connected) {
        const provider = await getProviderOrSigner();

        const icoContract = new ethers.Contract(
          ICOContractAddress,
          ICOabi,
          provider
        );
        const signer = await getProviderOrSigner(true);
        const address = signer.getAddress();

        //calling the balanceOF(address)
        const balance = await icoContract.balanceOf(address);
        // console.log("balance of cd token", balance);
        const convertToInt = parseInt(ethers.utils.formatEther(balance));
        setBalanceOfCDToken(convertToInt);
      } else {
        console.warn("waiting to setup conncntn");
      }
    } catch (error) {
      console.error(error);
    }
  };

  //TOdo 3. get the no of nft token minted by user is [no of token] THEN claim() OR public mint()
  const getNumOfNFTToken = async () => {
    try {
      if (connected) {
        const provider = await getProviderOrSigner();

        const nftContract = new ethers.Contract(
          NFTContarctAddress,
          NFTabi,
          provider
        );

        const icoContract = new ethers.Contract(
          ICOContractAddress,
          ICOabi,
          provider
        );

        //get the balance of no of token holded by any address - balanceOf(address owner)
        const signer = await getProviderOrSigner(true);
        const address = signer.getAddress();
        const nftBalance = await nftContract.balanceOf(address);

        if (nftBalance.toString() === "0") {
          setTokensToBeClaimed(nftBalance.toString());
        } else {
          //TODO a. check for the tokenID -tokenOfOwnerByIndex(address owner, uint256 index) and then which is already clamied tokenIdsClaimed()
          var amount = 0;
          for (let i = 0; i < nftBalance; i++) {
            const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
            const claimed = await icoContract.tokenIdsClaimed(tokenId);

            if (!claimed) {
              amount++;
            }
            // console.log("amount", amount);
            setTokensToBeClaimed(amount.toString());
          }
        }
      } else {
        console.warn("waiting to setup conncntn");
      }
    } catch (error) {
      console.error(error);
    }
  };

  //TODO 4. claim token against NFT
  const claimTokensOnNFT = async () => {
    try {
      if (connected) {
        progress.start();
        const signer = await getProviderOrSigner(true);

        const icoContract = new ethers.Contract(
          ICOContractAddress,
          ICOabi,
          signer
        );

        const txn = await icoContract.claim();
        await txn.wait();

        //update ui var
        await getOverallTokensMinted();
        await getBalanceOfCryptoDevTokens();
        await getNumOfNFTToken();
        progress.finish();
      } else {
        console.warn("waiting to setup conncntn");
      }
    } catch (error) {
      progress.finish();
      console.error(error);
    }
  };

  //TODO 5. function to mint() by any user
  const publicMint = async (amount) => {
    try {
      if (amount < 5) {
        alert("Minimum token to be minted is 5");
        return;
      }

      progress.start();
      const signer = await getProviderOrSigner(true);
      const icoContract = new ethers.Contract(
        ICOContractAddress,
        ICOabi,
        signer
      );

      //calc the mount of ether to pass down [price of 1 tokene x no of token]
      let value = 0.001 * amount;
      // mint(uint256 amount)
      const txn = await icoContract.mint(amount, {
        value: ethers.utils.parseEther(value.toString()),
      });
      await txn.wait();

      //update ui var
      await getOverallTokensMinted();
      await getBalanceOfCryptoDevTokens();
      await getNumOfNFTToken();

      progress.finish();
    } catch (error) {
      progress.finish();
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);

      if (needSigner) {
        const signer = provider.getSigner();
        return signer;
      }

      return provider;
    }
  };

  const onPageLoadAction = async () => {
    await getOverallTokensMinted();
    await getBalanceOfCryptoDevTokens();
    await getNumOfNFTToken();
  };

  useEffect(() => {
    onPageLoadAction();

    ethereum.on("accountsChanged", (accounts) => onPageLoadAction());
  }, [connected]);

  const renderButton = () => {
    if (connected) {
      return (
        <div className="flex justify-start items-center">
          <input
            type="number"
            className="border-2 border-gray-500 rounded-md h-10 mt-3  mr-3"
            placeholder="Amount of Tokens"
            onChange={(e) =>
              e.target.value > 0
                ? setTokenAmount(BigNumber.from(e.target.value))
                : setTokenAmount(BigNumber.from(zero))
            }
          />
          <button
            disabled={tokenAmount <= zero}
            onClick={() => publicMint(tokenAmount)}
            className="p-3 text-lg font-semibold text-white bg-[#FF6366] mt-4 hover:text-[#FF6366] hover:bg-white hover:border-2 duration-200 ease-out hover:border-black disabled:bg-gray-400 disabled:border-none disabled:text-white"
          >
            Mint Tokens
          </button>
        </div>
      );
    } else if (!connected) {
      return (
        <div className="flex justify-start">
          <button
            onClick={() => connect(connectors[0])}
            className="p-3 text-lg font-semibold text-white bg-[#FF6366] mt-4 hover:text-[#FF6366] hover:bg-white hover:border-2 duration-200 ease-out hover:border-black"
          >
            Connect your wallet
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta property="og:title" content="Whitelist" key="title" />
      </Head>
      {connected && (
        <header className="flex border-b justify-end bg-gray-500">
          <div className="flex text-xs flex-col mb-2 mt-2 space-y-1 text-white">
            <p className=" mr-16 text-xs font-normal">
              Hello, {data?.address.slice(0, 5)}....
              {data?.address.slice(data?.address.length - 4)}
            </p>
            <div>
              <button
                onClick={disconnect}
                className="text-sm font-bold underline underline-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="min-h-[85vh] pl-24 pr-24 flex items-center justify-center">
        <div className="flex-1">
          <h2 className="font-mono  font-semibold text-5xl flex-grow">
            Welcome to Crypto Devs!
          </h2>
          <p className="descText">
            {" "}
            You can claim or mint Crypto Dev tokens here
          </p>
          {connected && (
            <p className="descText">
              You have minted{" "}
              <span className="underline font-semibold">
                {balanceOfCDToken}
              </span>{" "}
              Crypto Dev Tokens
            </p>
          )}
          <p className="descText">
            {" "}
            Overall{" "}
            <span className="underline font-semibold">
              {overallToken}/10000
            </span>{" "}
            have been minted!!!{" "}
          </p>

          {connected && (
            <div className="border-green-600  border-2 items-center justify-between flex w-1/2 mt-3 p-3">
              <p>
                {" "}
                <span className="underline font-semibold">
                  {Number(tokensToBeClaimed) * 10} Tokens
                </span>{" "}
                {Number(tokensToBeClaimed) != 0
                  ? "can be claimed!"
                  : " to be claimed- You need to have atleast one Crypto Dev NFT!"}
              </p>
              <p
                onClick={claimTokensOnNFT}
                className="text-lg font-bold text-green-600 underline self-center cursor-pointer underline-offset-2 hover:text-red-600 hover:scale-90 duration-150 transition ease-out"
              >
                {Number(tokensToBeClaimed) != 0 ? " Claim Now!" : ""}
              </p>
            </div>
          )}

          {renderButton()}
        </div>

        <Image src={coverImage} objectFit="cover" alt="Dev" />
      </main>

      <footer className="flex justify-center mt-6 text-gray-500">
        Made with &#10084; by Aayush
      </footer>
    </div>
  );
}
