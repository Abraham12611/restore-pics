import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css';
import PlausibleProvider from 'next-plausible';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <PlausibleProvider domain='restorephotos.io'>
        <Component {...pageProps} />
      </PlausibleProvider>
    </ClerkProvider>
  );
}

export default MyApp;
