import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { useAccount, useConnect, useEnsAvatar } from "wagmi";
import coverImage from "../public/cover.svg";

export default function Home() {
  const log = console.log.bind(console);
  const [{ data }, disconnect] = useAccount();
  const [
    {
      data: { connected, connectors },
    },
    connect,
  ] = useConnect();

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
              Hello, {data?.address.slice(0, 5)} ....
              {data?.address.slice(data?.address.length - 4)}
            </p>
            <div>
              <button onClick={disconnect} className="text-sm font-bold underline underline-offset-2">
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
            You have minted <span className="underline font-semibold">200</span>{" "}
            Crypto Dev Tokens
          </p>
          <p className="descText">
            {" "}
            Overall <span className="underline font-semibold">
              2500/10000
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
