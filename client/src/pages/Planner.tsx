import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, Loader2, AlertCircle, CheckCircle2,
  MapPin, Calendar, DollarSign, Sliders, Shield, Award, Landmark 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const plannerSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  duration: z.number().min(1, { message: 'Min 1 day.' }).max(10, { message: 'Max 10 days.' }),
  currency: z.string().min(1),
  budget: z.enum(['Backpacker', 'Mid-range', 'Luxury']),
  style: z.enum(['Cultural', 'Adventure', 'Relaxed', 'Historical', 'Culinary']),
  accessibility: z.boolean().default(false),
  dietary: z.string().optional(),
});

type PlannerFormValues = z.infer<typeof plannerSchema>;

const LOADING_STEPS = [
  'Mapping landmark coordinates...',
  'Weaving folklore legends and historical context...',
  'Curating off-the-beaten-path hidden gems...',
  'Selecting traditional recipes & culinary streets...',
  'Pinpointing local artisan workshops...',
  'Optimizing daily transit routes...',
];

const INTEREST_OPTIONS = [
  'Art & Painting',
  'UNESCO Heritage',
  'Folklore & Myths',
  'Craft Workshops',
  'Market Streets',
  'Traditional Dance',
  'Wellness & Spa',
  'Culinary Tasting'
];

export default function Planner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const defaultDestination = searchParams.get('destination') || '';

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      destination: defaultDestination,
      duration: 3,
      currency: 'USD',
      budget: 'Mid-range',
      style: 'Cultural',
      accessibility: false,
      dietary: '',
    }
  });

  const durationVal = watch('duration');

  useEffect(() => {
    if (defaultDestination) {
      setValue('destination', defaultDestination);
    }
  }, [defaultDestination, setValue]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const onSubmit = async (values: PlannerFormValues) => {
    setLoading(true);
    setError('');
    setLoadingStepIdx(0);

    const payload = {
      ...values,
      interests: selectedInterests
    };

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.details || 'Generation failed.');
      }

      const planResult = await response.json();
      localStorage.setItem('currentPlan', JSON.stringify(planResult));

      // Visual Success Toast display
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
        navigate('/dashboard', { state: { plan: planResult } });
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-16 relative">
      <AnimatePresence>
        {/* Success Toast */}
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] flex items-center space-x-3 px-5 py-3 rounded-lg border border-emerald-500/30 bg-emerald-950/90 text-emerald-200 text-xs font-semibold shadow-2xl backdrop-blur"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span>Itinerary generated successfully! Unpacking journey details...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading && !showToast ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl px-6 text-center"
          >
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-24 h-24 rounded-full border border-brand-gold/30 animate-pulse"></div>
              <div className="absolute w-32 h-32 rounded-full border border-brand-gold/10 animate-ping"></div>
              <Loader2 className="h-10 w-10 text-brand-gold animate-spin" />
            </div>

            <h2 className="text-2xl font-bold font-serif text-white mb-2">Architecting Your Experience</h2>
            
            <div className="h-8 flex items-center justify-center">
              <motion.p
                key={loadingStepIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-brand-gold font-mono text-sm"
              >
                {LOADING_STEPS[loadingStepIdx]}
              </motion.p>
            </div>
            
            <p className="text-gray-500 text-xs mt-6 max-w-sm">
              Please wait while Gemini generates coordinates, legends, food specialties, and optimized routes.
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
                <Compass className="h-6 w-6 text-brand-gold animate-spin-slow" />
                <h2 className="text-2xl font-bold font-serif text-white font-normal">Journey Specification</h2>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3 text-rose-300 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-200">Architecting Failed</h4>
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-brand-gold/50 focus:outline-none text-white text-sm glow-input transition-all"
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

                {/* Duration Slider */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <span>Duration</span>
                    <span className="text-brand-gold font-mono">{durationVal} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="w-full accent-brand-gold bg-slate-900 border border-white/5 rounded-lg h-2"
                    {...register('duration', { valueAsNumber: true })}
                  />
                </div>

                {/* Currency & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="currency" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preferred Currency</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <select
                        id="currency"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-brand-gold/50 focus:outline-none text-white text-sm glow-input transition-all appearance-none"
                        {...register('currency')}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label htmlFor="budget" className="text-xs font-bold text-gray-400 uppercase tracking-wide">Budget Tier</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <select
                        id="budget"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-brand-gold/50 focus:outline-none text-white text-sm glow-input transition-all appearance-none"
                        {...register('budget')}
                      >
                        <option value="Backpacker">Backpacker (Budget-conscious)</option>
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-brand-gold/50 focus:outline-none text-white text-sm glow-input transition-all appearance-none"
                      {...register('style')}
                    >
                      <option value="Cultural">Cultural Immersive (Art, folklore, traditions)</option>
                      <option value="Historical">Historical Discovery (UNESCO, temples, ruins)</option>
                      <option value="Culinary">Culinary Explorer (Traditional food, local markets)</option>
                      <option value="Adventure">Adventure & Explorer (Active tracks, hiking)</option>
                      <option value="Relaxed">Slow & Relaxed (Wellness, scenic walks)</option>
                    </select>
                  </div>
                </div>

                {/* Interests Chips */}
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Interests</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {INTEREST_OPTIONS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                            isSelected 
                              ? 'bg-brand-gold border-brand-gold text-slate-950 font-bold' 
                              : 'bg-slate-900/40 border-white/10 text-gray-300 hover:border-brand-gold/40'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accessibility Toggle & Dietary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/20 border border-white/10">
                    <input
                      id="accessibility"
                      type="checkbox"
                      className="h-4 w-4 accent-brand-gold rounded border-white/10"
                      {...register('accessibility')}
                    />
                    <label htmlFor="accessibility" className="text-xs font-bold text-gray-300 uppercase tracking-wide cursor-pointer select-none">
                      Require Paved / Ramp Access
                    </label>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative">
                      <Award className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                      <input
                        id="dietary"
                        type="text"
                        placeholder="Dietary Restrictions (e.g. Vegetarian)"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 focus:border-brand-gold/50 focus:outline-none text-white text-sm glow-input transition-all"
                        {...register('dietary')}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 font-extrabold text-xs tracking-widest uppercase flex items-center justify-center space-x-2 shadow-lg shadow-brand-gold/15 transition-all duration-300 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
