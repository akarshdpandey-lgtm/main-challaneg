import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, ArrowRight, Loader2, AlertCircle, 
  MapPin, Calendar, DollarSign, Sliders, Shield, Award 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const plannerSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  duration: z.number().min(1, { message: 'Duration must be at least 1 day.' }).max(10, { message: 'Maximum itinerary duration is 10 days.' }),
  budget: z.enum(['Backpacker', 'Mid-range', 'Luxury']),
  style: z.enum(['Cultural', 'Adventure', 'Relaxed', 'Historical', 'Culinary']),
  accessibility: z.string().optional(),
  dietary: z.string().optional(),
});

const LOADING_STEPS = [
  'Mapping landmark coordinates...',
  'Weaving folklore legends and historical context...',
  'Curating off-the-beaten-path hidden gems...',
  'Selecting traditional recipes & culinary streets...',
  'Pinpointing local artisan workshops...',
  'Optimizing daily transit routes...',
];

export default function Planner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const defaultDestination = searchParams.get('destination') || '';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      destination: defaultDestination,
      duration: 3,
      budget: 'Mid-range',
      style: 'Cultural',
      accessibility: '',
      dietary: '',
    }
  });

  useEffect(() => {
    if (defaultDestination) {
      setValue('destination', defaultDestination);
    }
  }, [defaultDestination, setValue]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setLoadingStepIdx(0);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.details || 'Failed to generate itinerary. Please try again.');
      }

      const planResult = await response.json();
      localStorage.setItem('currentPlan', JSON.stringify(planResult));
      navigate('/dashboard', { state: { plan: planResult } });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-16 relative">
      <AnimatePresence mode="wait">

        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-xl px-6 text-center"
          >
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-24 h-24 rounded-full border border-violet-500/30 animate-pulse"></div>
              <div className="absolute w-32 h-32 rounded-full border border-violet-500/10 animate-ping"></div>
              <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
            </div>

            <h2 className="text-2xl font-bold font-sans text-white mb-2">Curating Your Immersive Experience</h2>
            
            <div className="h-8 flex items-center justify-center">
              <motion.p
                key={loadingStepIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-violet-400 font-mono text-sm"
              >
                {LOADING_STEPS[loadingStepIdx]}
              </motion.p>
            </div>
            
            <p className="text-gray-500 text-xs mt-6 max-w-sm">
              Please wait while Google Gemini synthesizes coordinates, legends, and travel logistics.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="card-glow border-white/10">
              <div className="mb-6 flex items-center space-x-2">
                <Compass className="h-6 w-6 text-violet-400 animate-spin-slow" />
                <h2 className="text-2xl font-bold font-sans text-white">Travel Specifications</h2>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3 text-rose-300 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-200">Generation Failed</h4>
                    <p className="mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Destination */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="destination" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                    <input
                      id="destination"
                      type="text"
                      placeholder="e.g. Kyoto, Japan or Rome, Italy"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm glow-input transition-all"
                      {...register('destination')}
                      aria-invalid={errors.destination ? 'true' : 'false'}
                    />
                  </div>
                  {errors.destination && (
                    <span className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.destination.message}
                    </span>
                  )}
                </div>

                {/* Duration & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="duration" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Duration (Days)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <input
                        id="duration"
                        type="number"
                        min="1"
                        max="10"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm glow-input transition-all"
                        {...register('duration', { valueAsNumber: true })}
                        aria-invalid={errors.duration ? 'true' : 'false'}
                      />
                    </div>
                    {errors.duration && (
                      <span className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.duration.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="budget" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Budget Tier</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <select
                        id="budget"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm glow-input transition-all appearance-none"
                        {...register('budget')}
                      >
                        <option value="Backpacker">Backpacker (Budget-aware)</option>
                        <option value="Mid-range">Mid-range (Balanced)</option>
                        <option value="Luxury">Luxury (Premium)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Style */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="style" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Travel Focus</label>
                  <div className="relative">
                    <Sliders className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                    <select
                      id="style"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm glow-input transition-all appearance-none"
                      {...register('style')}
                    >
                      <option value="Cultural">Cultural Immersive (Art, folklore, traditions)</option>
                      <option value="Historical">Historical Discovery (Heritage sites, temples, ruins)</option>
                      <option value="Culinary">Culinary Explorer (Traditional food, local markets)</option>
                      <option value="Adventure">Adventure & Explorer (Active tracks, hiking, landscapes)</option>
                      <option value="Relaxed">Slow & Relaxed (Gardens, wellness, scenic walks)</option>
                    </select>
                  </div>
                </div>

                {/* Accessibility & Dietary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="accessibility" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Accessibility (Optional)</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <input
                        id="accessibility"
                        type="text"
                        placeholder="e.g. Wheelchair access, low-walking"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm glow-input transition-all"
                        {...register('accessibility')}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="dietary" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Dietary (Optional)</label>
                    <div className="relative">
                      <Award className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <input
                        id="dietary"
                        type="text"
                        placeholder="e.g. Vegetarian, Halal, Nut-Free"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm glow-input transition-all"
                        {...register('dietary')}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Sparkles className="h-4 w-4 relative z-10 animate-pulse" />
                  <span className="relative z-10">Generate Cultural Plan</span>
                  <ArrowRight className="h-4 w-4 relative z-10" />
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
