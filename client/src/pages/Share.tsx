import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Share() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const data = searchParams.get('data');
    
    if (!data) {
      setError('No shared travel parameters were detected in the link.');
      return;
    }

    try {
      const decodedString = decodeURIComponent(atob(data));
      const parsedPlan = JSON.parse(decodedString);

      if (!parsedPlan.destinationInfo || !parsedPlan.itinerary) {
        throw new Error('Incomplete data structure.');
      }

      localStorage.setItem('currentPlan', JSON.stringify(parsedPlan));
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
            <h2 className="text-xl font-bold text-white font-serif">Unpacking Failed</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-sm bg-brand-gold text-gray-950 text-xs font-bold uppercase tracking-wider hover:bg-brand-gold-hover transition-all"
            >
              Go to Home Page
            </button>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 text-brand-gold animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white font-serif">Loading Shared Travel Itinerary</h2>
            <p className="text-gray-400 text-xs leading-relaxed">
              Decoding landmark details and cultural stories from the shared profile...
            </p>
          </>
        )}
      </GlassCard>
    </div>
  );
}
