import Head from "next/head";
import Image from "next/image";
import coverImage from "../public/cover.svg";

export default function Home() {
  const renderButton = () => {
    return (
      <div className="flex justify-start">
        <button
          className="p-3 text-lg font-semibold text-white bg-[#FF6366] mt-4 hover:text-[#FF6366] hover:bg-white hover:border-2 duration-200 ease-out hover:border-black"
          onClick=""
        >
          Connect your wallet
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta property="og:title" content="Whitelist" key="title" />
      </Head>

      <main className="min-h-[90vh] p-24 flex items-center justify-center">
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
