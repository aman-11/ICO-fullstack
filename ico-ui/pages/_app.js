import { WagmiProvider } from 'wagmi'
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider autoConnect>
      <Component {...pageProps} />
    </WagmiProvider>
  );
}

export default MyApp;
