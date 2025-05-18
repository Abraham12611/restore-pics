'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Header() {
  const { isSignedIn } = useUser();
  const { data, error } = useSWR(isSignedIn ? '/api/get-user-credits' : null, fetcher, { refreshInterval: 5000 });

  const credits = data?.credits;

  return (
    <header className='flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2'>
      <Link href='/' className='flex space-x-2'>
        <Image
          alt='header text'
          src='/imageIcon.png'
          className='sm:w-10 sm:h-10 w-7 h-7'
          width={20}
          height={20}
        />
        <h1 className='sm:text-3xl text-xl font-bold ml-2 tracking-tight'>
          restorePics
        </h1>
      </Link>
      <div className='flex space-x-4 items-center'>
        <Link
          href='/'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>Home</p>
        </Link>
        <Link
          href='./restore'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>Restore</p>
        </Link>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          {typeof credits === 'number' && (
            <p className='text-gray-700 font-medium text-sm'>
              Credits: {credits}
            </p>
          )}
          <Link
            href='/pricing'
            className='text-white bg-blue-500 hover:bg-blue-600 font-medium py-2 px-3 rounded-lg transition-colors text-sm'
          >
            Buy Credits
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
