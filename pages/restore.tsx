import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { UrlBuilder } from '@bytescale/sdk';
import {
  UploadWidgetConfig,
  UploadWidgetOnPreUploadResult,
} from '@bytescale/upload-widget';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { CompareSlider } from '../components/CompareSlider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LoadingDots from '../components/LoadingDots';
import Toggle from '../components/Toggle';
import appendNewToName from '../utils/appendNewToName';
import downloadPhoto from '../utils/downloadPhoto';
import { useUser, SignInButton } from '@clerk/nextjs';
import useSWR from 'swr';
import { Rings } from 'react-loader-spinner';

const Home: NextPage = () => {
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, mutate } = useSWR('/api/remaining', fetcher);
  const { isLoaded, isSignedIn, user } = useUser();

  const options: UploadWidgetConfig = {
    apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : 'free',
    maxFileCount: 1,
    mimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    editor: { images: { crop: false } },
    styles: { colors: { primary: '#000' } },
    onPreUpload: async (
      file: File
    ): Promise<UploadWidgetOnPreUploadResult | undefined> => {
      // NSFW detection temporarily disabled
      // let isSafe = true;
      // try {
      //   // Convert file to URL for API
      //   const fileUrl = URL.createObjectURL(file);
      //   const response = await axios.post('/api/nsfw-check', {
      //     imageUrl: fileUrl
      //   });

      //   // PixLab returns a score between 0 and 1, where closer to 1 means more likely NSFW
      //   isSafe = response.data.score < 0.7; // You can adjust this threshold
      //   console.log({ nsfwScore: response.data.score });
      // } catch (error) {
      //   console.error('NSFW check error:', error);
      // }
      // if (!isSafe) {
      //   return { errorMessage: 'Detected a NSFW image which is not allowed.' };
      // }
      if (data?.credits <= 0) {
        return { errorMessage: 'No credits remaining. Please purchase credits to continue.' };
      }
      return undefined;
    },
  };

  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        console.log('onUpdate triggered');
        if (uploadedFiles.length !== 0) {
          console.log('File uploaded:', uploadedFiles[0]);
          const image = uploadedFiles[0];
          const imageName = image.originalFile.originalFileName;
          const imageUrl = UrlBuilder.url({
            accountId: image.accountId,
            filePath: image.filePath,
            options: {
              transformation: 'preset',
              transformationPreset: 'thumbnail',
            },
          });
          console.log('Generated imageUrl:', imageUrl);
          setPhotoName(imageName);
          setOriginalPhoto(imageUrl);
          generatePhoto(imageUrl);
        }
      }}
      width='670px'
      height='250px'
    />
  );

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: fileUrl }),
    });

    let newPhoto = await res.json();

    console.log('Raw API response for restored image:', newPhoto);

    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      // The API should return the image URL directly as a string
      if (typeof newPhoto === 'string' && newPhoto !== '') {
        mutate();
        setRestoredImage(newPhoto);
        setRestoredLoaded(true);
      } else {
        console.error('API returned unexpected data format for restored image:', newPhoto);
        setError('Failed to get valid image URL from API.');
      }
    }
    setLoading(false);
  }

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>Restore Photos</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8'>
        <a
          className='border shadow-xl flex max-w-md rounded-xl mb-6 hover:scale-[1.02] transition duration-300 ease-in-out'
          href='https://www.roomgpt.io/'
          target='_blank'
        >
          <div className="relative w-full">
            <img
              src='/roomgpt-ad.png'
              alt='roomgpt ad'
              className='w-full rounded-lg filter brightness-90'
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-center text-xl font-bold p-2">NEW AI FEATURE COMING SOON!</span>
            </div>
          </div>
        </a>
        <h1 className='mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl mb-5'>
          Restore any face photo
        </h1>
        {isSignedIn && data && (
          <p className='text-slate-500'>
            You have{' '}
            <span className='font-semibold'>
              {data.credits} credit{data.credits !== 1 ? 's' : ''}
            </span>{' '}
            remaining.
          </p>
        )}
        <div className='flex justify-between items-center w-full flex-col mt-4'>
          <Toggle
            className={`${restoredLoaded ? 'visible mb-6' : 'invisible'}`}
            sideBySide={sideBySide}
            setSideBySide={(newVal) => setSideBySide(newVal)}
          />
          {restoredLoaded && sideBySide && (
            <CompareSlider
              original={originalPhoto!}
              restored={restoredImage!}
            />
          )}
          {!isLoaded ? (
            <div className='max-w-[670px] h-[250px] flex justify-center items-center'>
              <Rings
                height='100'
                width='100'
                color='black'
                radius='6'
                wrapperStyle={{}}
                wrapperClass=''
                visible={true}
                ariaLabel='rings-loading'
              />
            </div>
          ) : isSignedIn && !originalPhoto ? (
            <UploadDropZone />
          ) : (
            !originalPhoto && (
              <div className='h-[250px] flex flex-col items-center space-y-6 max-w-[670px] -mt-8'>
                <div className='max-w-xl text-gray-600'>
                  Sign in below with Google to create a free account and restore
                  your photos today. You will be able to restore 2 photos per
                  day for free.
                </div>
                <SignInButton mode="modal">
                  <button
                    className='bg-gray-200 text-black font-semibold py-3 px-6 rounded-2xl flex items-center space-x-2'
                  >
                    <Image
                      src='/google.png'
                      width={20}
                      height={20}
                      alt="google's logo"
                    />
                    <span>Sign in with Google</span>
                  </button>
                </SignInButton>
              </div>
            )
          )}
          {originalPhoto && !restoredImage && originalPhoto !== '' && (
            <Image
              alt='original photo'
              src={originalPhoto}
              className='rounded-2xl'
              width={475}
              height={475}
            />
          )}
          {restoredImage && originalPhoto && !sideBySide && restoredImage !== '' && (
            <div className='flex sm:space-x-4 sm:flex-row flex-col'>
              <div>
                <h2 className='mb-1 font-medium text-lg'>Original Photo</h2>
                {originalPhoto && originalPhoto !== '' && (
                  <Image
                    alt='original photo'
                    src={originalPhoto}
                    className='rounded-2xl relative'
                    width={475}
                    height={475}
                  />
                )}
              </div>
              <div className='sm:mt-0 mt-8'>
                <h2 className='mb-1 font-medium text-lg'>Restored Photo</h2>
                {/* Render the anchor and img only if restoredImage is a valid string */}
                {typeof restoredImage === 'string' && restoredImage !== '' && (
                  <a href={restoredImage} target='_blank' rel='noreferrer'>
                    <img
                      alt='restored photo'
                      src={restoredImage}
                      className='rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in'
                      width={475}
                      height={475}
                    />
                  </a>
                )}
              </div>
            </div>
          )}
          {loading && (
            <button
              disabled
              className='bg-black rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 hover:bg-black/80 w-40'
            >
              <span className='pt-4'>
                <LoadingDots color='white' style='large' />
              </span>
            </button>
          )}
          {error && (
            <div
              className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8 max-w-[575px]'
              role='alert'
            >
              <div className='bg-red-500 text-white font-bold rounded-t px-4 py-2'>
                Please try again in 24 hours
              </div>
              <div className='border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700'>
                {error}
              </div>
            </div>
          )}
          <div className='flex space-x-2 justify-center'>
            {originalPhoto && !loading && (
              <button
                onClick={() => {
                  setOriginalPhoto(null);
                  setRestoredImage(null);
                  setRestoredLoaded(false);
                  setError(null);
                }}
                className='bg-black rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-black/80 transition'
              >
                Upload New Photo
              </button>
            )}
            {restoredLoaded && (
              <button
                onClick={() => {
                  downloadPhoto(restoredImage!, appendNewToName(photoName!));
                }}
                className='bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition'
              >
                Download Restored Photo
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
