import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Share() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    
    if (!data) {
      setError('No shared travel parameters were detected in the link.');
      return;
    }

    try {
      // Decode URL safe Base64 representation
      const decodedString = decodeURIComponent(atob(data));
      const parsedPlan = JSON.parse(decodedString);

      if (!parsedPlan.destinationInfo || !parsedPlan.itinerary) {
        throw new Error('Incomplete data structure.');
      }

      // Sync unpacked data to cache
      localStorage.setItem('currentPlan', JSON.stringify(parsedPlan));
      
      // Redirect to main view using react-router state
      navigate('/dashboard', { state: { plan: parsedPlan }, replace: true });
    } catch (err) {
      console.error('Decoding shared plan failed:', err);
      setError('Failed to unpack the shared travel plan. The link might be broken or incomplete.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="max-w-md mx-auto px-6 pt-32 pb-16 text-center">
      <GlassCard className="space-y-6">

        {error ? (
          <>
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">Unpacking Failed</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              Go to Home Page
            </button>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white">Loading Shared Travel Itinerary</h2>
            <p className="text-gray-400 text-xs leading-relaxed">
              Decoding landmark details and cultural stories from the shared profile...
            </p>
          </>
        )}
      </GlassCard>
    </div>
  );
}
