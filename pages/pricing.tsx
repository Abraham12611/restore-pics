'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '@clerk/nextjs';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '$5',
    credits: '35 credits',
    features: [
      '35 photo restores',
      'Any type of photo',
    ]
  },
  {
    id: 'popular',
    name: 'Popular Plan',
    price: '$10',
    credits: '75 credits',
    features: [
      '75 photo restores',
      'Any type of photo',
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$20',
    credits: '150 credits',
    features: [
      '150 photo restores',
      'Any type of photo',
    ]
  },
];

export default function PricingPage() {
  const { isSignedIn, user } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    if (!isSignedIn) {
      setError('Please sign in to purchase credits.');
      return;
    }
    setLoadingPlan(planId);
    setError(null);
    try {
      const response = await fetch('/api/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }
      window.location.href = data.url; // Redirect to Polar checkout
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
    setLoadingPlan(null);
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 text-center">
        <p className="text-sm font-medium">
          <span className="font-bold">Start strong with 40% off</span> your first order. Use code <span className="font-bold">GHU663</span> today!
        </p>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-gray-800 sm:text-7xl">
          Choose Your Plan
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 leading-7">
          Select the credit package that best suits your needs. More credits mean more photos restored!
        </p>

        {error && (
          <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl w-full">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-8 border rounded-lg shadow-lg flex flex-col items-center transition-all duration-300 ease-in-out
                ${plan.id === 'popular'
                  ? 'border-blue-500 transform scale-105 hover:scale-110'
                  : 'border-gray-300 hover:scale-105 hover:border-blue-300'
                }`}
            >
              <h2 className="text-2xl font-semibold text-gray-700">{plan.name}</h2>
              <p className="mt-4 text-4xl font-bold text-gray-800">{plan.price}</p>
              <p className="mt-2 text-lg text-gray-600">{plan.credits}</p>

              <ul className="mt-6 space-y-3 text-left w-full">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`mt-8 w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300
                  ${loadingPlan === plan.id
                    ? 'bg-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1'
                  }
                  ${!isSignedIn && 'opacity-50 cursor-not-allowed'}`}
              >
                {loadingPlan === plan.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}