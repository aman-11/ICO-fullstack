import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useProvider } from "wagmi";
import { ethers, BigNumber } from "ethers";
import coverImage from "../public/cover.svg";
import { ICOContractAddress, ICOabi } from "../constants/icoVariable";
import detectEthereumProvider from "@metamask/detect-provider";

export default function Home() {
  // const provider = useProvider();
  const [overallToken, setOverallToken] = useState(0);
  const [balanceOfCDToken, setBalanceOfCDToken] = useState(0);
  const [{ data }, disconnect] = useAccount();
  const [
    {
      data: { connected, connectors },
    },
    connect,
  ] = useConnect();

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
        // console.log("overrallvalue", _overallTokenMinted.toString());

        setOverallToken(_overallTokenMinted.toString());
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
        setBalanceOfCDToken(balance.toString());
      } else {
        console.warn("waiting to setup conncntn");
      }
    } catch (error) {
      console.error(error);
    }
  };

  //TOdo 3. get the no of nft token minted by user [no of token] ? claim() : public mint()

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
  };

  useEffect(() => {
    onPageLoadAction();
  }, [connected]);

  const renderButton = () => {
    if (connected) {
      return (
        <div className="flex justify-start">
          <button className="p-3 text-lg font-semibold text-white bg-[#FF6366] mt-4 hover:text-[#FF6366] hover:bg-white hover:border-2 duration-200 ease-out hover:border-black">
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
          <p className="descText">
            You have minted{" "}
            <span className="underline font-semibold">{balanceOfCDToken}</span>{" "}
            Crypto Dev Tokens
          </p>
          <p className="descText">
            {" "}
            Overall{" "}
            <span className="underline font-semibold">
              {overallToken}/10000
            </span>{" "}
            have been minted!!!{" "}
          </p>
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
