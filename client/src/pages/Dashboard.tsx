import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Landmark, Heart, Calendar, Clock, MapPin, 
  Share2, Printer, BookOpen, Volume2, VolumeX, ArrowLeft, X,
  ExternalLink, Sparkles, Map, Check
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MapContainer from '../components/MapContainer';

interface Activity {
  timeOfDay: string;
  name: string;
  type: string;
  duration: string;
  travelTime?: string;
  cost: string;
  description: string;
  latitude: number;
  longitude: number;
  transitInfo?: string;
}

interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

interface HeritageSite {
  name: string;
  description: string;
  history: string;
  preservationInfo: string;
  artisanRecommendation: string;
  latitude: number;
  longitude: number;
  tips?: string;
}

interface FoodItem {
  name: string;
  description: string;
  whereToTry: string;
  dietaryNotes?: string;
}

interface MarketItem {
  name: string;
  description: string;
  whatToBuy: string;
  hours: string;
}

interface WorkshopItem {
  name: string;
  description: string;
  bookingTip: string;
}

interface PerformanceItem {
  name: string;
  description: string;
  culturalSignificance: string;
}

interface LocalExperiences {
  traditionalFoods: FoodItem[];
  localMarkets: MarketItem[];
  workshops: WorkshopItem[];
  musicAndDance: PerformanceItem[];
}

interface EventItem {
  name: string;
  dateRange: string;
  description: string;
  culturalSignificance: string;
}

interface StoryMode {
  title: string;
  story: string;
  historicalContext: string;
  localLegend: string;
  significance: string;
}

interface DestinationInfo {
  name: string;
  summary: string;
  history: string;
  bestTimeToVisit: string;
  currency: string;
  localLanguage: string;
  safetyTips: string;
  culturalDos: string[];
  culturalDonts: string[];
}

interface TravelPlan {
  destinationInfo: DestinationInfo;
  culturalStory: StoryMode;
  heritageSites: HeritageSite[];
  localExperiences: LocalExperiences;
  localEvents: EventItem[];
  itinerary: DayPlan[];
  hiddenGems: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    whySpecial: string;
  }[];
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [activeTab, setActiveTab] = useState<string>('itinerary');
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load plan from location state or cache
  useEffect(() => {
    const statePlan = location.state?.plan;
    const localPlan = localStorage.getItem('currentPlan');

    if (statePlan) {
      setPlan(statePlan);
    } else if (localPlan) {
      try {
        setPlan(JSON.parse(localPlan));
      } catch (err) {
        console.error('Failed to parse cached plan:', err);
      }
    }
  }, [location.state]);

  if (!plan) {
    return (
      <div className="max-w-md mx-auto px-6 pt-32 pb-16 text-center space-y-6">
        <GlassCard className="card-glow">
          <h2 className="text-xl font-bold text-white font-serif">No Journey Active</h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Specify your destination details to curating a journey profile.
          </p>
          <button 
            onClick={() => navigate('/planner')}
            className="w-full mt-6 py-3 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
          >
            <span>Start Plan</span>
          </button>
        </GlassCard>
      </div>
    );
  }

  const { destinationInfo, culturalStory, heritageSites, localExperiences, localEvents, itinerary, hiddenGems } = plan;

  // Flatten all activities
  const allAttractions = itinerary.reduce((acc: any[], day) => {
    return [...acc, ...day.activities.map(act => ({ ...act, day: day.day }))];
  }, []);

  const allMarkers = [
    ...allAttractions.map(act => ({
      name: act.name,
      description: act.description,
      latitude: act.latitude,
      longitude: act.longitude,
      type: act.type || 'heritage',
      cost: act.cost,
      duration: act.duration
    })),
    ...hiddenGems.map(gem => ({
      name: gem.name,
      description: gem.description,
      latitude: gem.latitude,
      longitude: gem.longitude,
      type: 'hidden_gem',
      whySpecial: gem.whySpecial
    }))
  ];

  const allRouteCoords = allAttractions.map(act => [act.latitude, act.longitude]);
  const defaultCenter = allRouteCoords.length > 0 ? allRouteCoords[0] : [35.0116, 135.7681];

  // Speech TTS Reader
  const speakStory = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    synthRef.current.cancel();
    const textToRead = `${culturalStory.title}. ${culturalStory.story}. Historical context: ${culturalStory.historicalContext}. Local significance: ${culturalStory.significance}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const stopStory = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const copyShareableLink = () => {
    try {
      const stringified = JSON.stringify(plan);
      const b64 = btoa(encodeURIComponent(stringified));
      const shareUrl = `${window.location.origin}/share?data=${b64}`;
      
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      console.error('Failed to copy share link:', e);
    }
  };

  const openGoogleMapsDirections = (lat: number, lng: number) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-[#0B0D12] text-gray-100 relative">
      
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[40%] h-[35%] bg-violet-900/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[35%] bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 space-y-10">
        
        {/* Header section with back option */}
        <div className="space-y-6">
          <button 
            onClick={() => navigate('/planner')}
            className="px-4 py-2 rounded-full border border-white/10 hover:border-brand-gold/40 bg-slate-900/30 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all duration-300 shadow cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>New journey</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Title Summary Left Column */}
            <div className="lg:col-span-8 space-y-3">
              <span className="text-[10px] font-bold font-mono tracking-[0.2em] text-brand-gold uppercase">Your Journey</span>
              <h1 className="text-5xl md:text-6xl font-serif font-normal text-white lowercase leading-none tracking-tight">
                {destinationInfo.name.split(',')[0]}
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl pt-2 font-normal opacity-90">
                {destinationInfo.summary}
              </p>
            </div>

            {/* Print, share, and story mode triggers */}
            <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end pb-1 relative z-10">
              <button 
                onClick={() => setShowStoryModal(true)}
                className="px-5 py-2.5 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 shadow-md cursor-pointer"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Story mode</span>
              </button>

              <button 
                onClick={copyShareableLink}
                className="px-5 py-2.5 rounded-sm border border-white/10 hover:border-brand-gold/40 bg-slate-900/35 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 shadow"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Share2 className="h-4 w-4 text-brand-gold shrink-0" />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>

              <button 
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-sm border border-white/10 hover:border-brand-gold/40 bg-slate-900/35 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 shadow"
              >
                <Printer className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic segmented tabs */}
        <div className="flex overflow-x-auto space-x-2 border-b border-white/5 pb-3">
          {[
            { id: 'attractions', name: 'Attractions', icon: Compass },
            { id: 'heritage', name: 'Heritage', icon: Landmark },
            { id: 'experiences', name: 'Experiences', icon: Heart },
            { id: 'events', name: 'Events', icon: Calendar },
            { id: 'itinerary', name: 'Itinerary', icon: Clock },
            { id: 'map', name: 'Map', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 shrink-0 cursor-pointer ${
                  isTabActive 
                    ? 'bg-brand-gold text-slate-950 shadow font-extrabold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4 w-4 ${isTabActive ? 'text-slate-950' : 'text-gray-500'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content panels */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* Attractions view */}
            {activeTab === 'attractions' && (
              <motion.div 
                key="attractions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {allAttractions.map((act, idx) => {
                  const isHiddenGem = hiddenGems.some(gem => gem.name.toLowerCase().includes(act.name.toLowerCase()) || act.name.toLowerCase().includes(gem.name.toLowerCase()));
                  return (
                    <div key={idx} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-gold/20 transition-all duration-300 relative group">
                      
                      {/* Image placeholder utilizing premium local skyline mockup background */}
                      <div className="h-40 rounded-xl bg-slate-950 border border-white/5 mb-4 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                        <Compass className="h-10 w-10 text-brand-gold/10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                        
                        {/* Tags list */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          <span className="text-[8px] font-bold font-mono tracking-widest text-brand-gold bg-slate-950/80 px-2 py-0.5 border border-brand-gold/20 rounded-full uppercase">Day {act.day}</span>
                          {isHiddenGem && (
                            <span className="text-[8px] font-bold font-mono tracking-widest text-pink-400 bg-slate-950/80 px-2 py-0.5 border border-pink-500/20 rounded-full uppercase">Hidden Gem</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold uppercase">Attraction</span>
                        <h3 className="font-serif text-lg font-normal text-white">{act.name}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{act.description}</p>
                      </div>

                      <div className="border-t border-white/5 pt-4 flex flex-col space-y-3">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                          <span>Cost: {act.cost}</span>
                          <span>Time: {act.duration}</span>
                        </div>
                        <button
                          onClick={() => openGoogleMapsDirections(act.latitude, act.longitude)}
                          className="w-full py-2 rounded border border-white/10 hover:border-brand-gold/40 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open in Maps</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Heritage Sites timeline layout */}
            {activeTab === 'heritage' && (
              <motion.div 
                key="heritage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {heritageSites.map((site, idx) => (
                    <div key={idx} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-brand-gold/20 transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold uppercase">UNESCO Heritage Site</span>
                          <span className="text-[9px] font-mono text-gray-500">Lat: {site.latitude} | Lng: {site.longitude}</span>
                        </div>
                        <h3 className="font-serif text-lg font-normal text-white">{site.name}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">{site.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <h4 className="font-bold text-brand-gold text-[10px] font-mono uppercase tracking-wider">Preservation ethos</h4>
                          <p className="text-gray-400 leading-relaxed text-[11px]">{site.preservationInfo}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-brand-gold text-[10px] font-mono uppercase tracking-wider">Nearby Artisan Curation</h4>
                          <p className="text-gray-400 leading-relaxed text-[11px]">{site.artisanRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Local Experiences Tab */}
            {activeTab === 'experiences' && (
              <motion.div 
                key="experiences"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Traditional foods */}
                {localExperiences.traditionalFoods.map((food, idx) => (
                  <div key={`food-${idx}`} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl hover:border-brand-gold/20 transition-all duration-300 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold uppercase">Food Specialty</span>
                      <h3 className="font-serif text-lg font-normal text-white mt-1">{food.name}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{food.description}</p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-4 text-[10px] text-gray-500 flex flex-col gap-0.5">
                      <span><strong>Best Area:</strong> {food.whereToTry}</span>
                      {food.dietaryNotes && <span className="text-brand-gold mt-1">Note: {food.dietaryNotes}</span>}
                    </div>
                  </div>
                ))}

                {/* Markets */}
                {localExperiences.localMarkets.map((market, idx) => (
                  <div key={`market-${idx}`} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl hover:border-brand-gold/20 transition-all duration-300 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold uppercase">Artisan Market</span>
                      <h3 className="font-serif text-lg font-normal text-white mt-1">{market.name}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{market.description}</p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-4 text-[10px] text-gray-500 flex flex-col gap-0.5">
                      <span><strong>Buy:</strong> {market.whatToBuy}</span>
                      <span><strong>Hours:</strong> {market.hours}</span>
                    </div>
                  </div>
                ))}

                {/* Workshops */}
                {localExperiences.workshops.map((shop, idx) => (
                  <div key={`shop-${idx}`} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl hover:border-brand-gold/20 transition-all duration-300 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold uppercase">Craft Workshop</span>
                      <h3 className="font-serif text-lg font-normal text-white mt-1">{shop.name}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{shop.description}</p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-4 text-[10px] text-gray-500">
                      <span className="inline-block text-[9px] text-cyan-400 bg-cyan-500/5 px-2 py-0.5 border border-cyan-500/10 rounded">
                        Booking: {shop.bookingTip}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Music and arts */}
                {localExperiences.musicAndDance.map((art, idx) => (
                  <div key={`art-${idx}`} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl hover:border-brand-gold/20 transition-all duration-300 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold uppercase">Performance</span>
                      <h3 className="font-serif text-lg font-normal text-white mt-1">{art.name}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{art.description}</p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-4 text-[10px] text-gray-500">
                      <span className="text-brand-gold leading-relaxed">Etiquette: {art.culturalSignificance}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Events view */}
            {activeTab === 'events' && (
              <motion.div 
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {localEvents.map((ev, idx) => (
                  <div key={idx} className="bg-slate-900/35 border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-gold/20 transition-all duration-300 relative overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-serif text-lg font-normal text-white">{ev.name}</h3>
                        <span className="text-[10px] font-bold font-mono tracking-widest text-brand-gold uppercase shrink-0 pt-1">
                          Festival
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 block">{ev.dateRange}</span>
                      <p className="text-gray-400 text-xs leading-relaxed">{ev.description}</p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-4 text-[10px] text-gray-500">
                      <strong>Tradition significance:</strong> {ev.culturalSignificance}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Itinerary Tab (2-column timeline and map split) */}
            {activeTab === 'itinerary' && (
              <motion.div 
                key="itinerary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left timeline */}
                <div className="lg:col-span-5 space-y-10 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin">
                  {itinerary.map((day) => {
                    const cleanCosts = day.activities
                      .map(a => parseFloat(a.cost.replace(/[^0-9.]/g, '')))
                      .filter(val => !isNaN(val));
                    const totalCost = cleanCosts.reduce((s, v) => s + v, 0);
                    const formattedTotal = totalCost > 0 ? `$${totalCost} USD` : 'Free';

                    return (
                      <div key={day.day} className="space-y-6">
                        {/* Day header */}
                        <div className="border-b border-brand-gold/20 pb-2 mb-4">
                          <h4 className="text-[11px] font-bold font-mono tracking-[0.25em] text-brand-gold uppercase">
                            Day {day.day} / {day.theme}
                          </h4>
                        </div>

                        {/* Activities list */}
                        <div className="space-y-6 pl-2">
                          {day.activities.map((act, aIdx) => (
                            <div key={aIdx} className="flex gap-4 items-start">
                              <span className="text-xs font-bold font-mono text-brand-gold text-right w-12 pt-0.5 shrink-0">
                                {act.timeOfDay}
                              </span>

                              <div className="space-y-1">
                                <h5 className="font-serif text-sm font-normal text-white">{act.name}</h5>
                                <span className="text-[10px] text-gray-400 block">
                                  {act.duration} · {act.travelTime || '0 min'} · {act.cost || 'Free'}
                                </span>
                                <p className="text-gray-400 text-xs leading-relaxed pt-1">{act.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Day totals */}
                        <div className="pl-14 pt-2">
                          <span className="text-xs font-bold font-mono text-brand-gold uppercase tracking-wider">
                            Estimated total · {formattedTotal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right map */}
                <div className="lg:col-span-7 h-[60vh] rounded-2xl overflow-hidden border border-white/5">
                  <MapContainer 
                    markers={allMarkers} 
                    route={allRouteCoords} 
                    center={defaultCenter} 
                  />
                </div>
              </motion.div>
            )}

            {/* Map tab */}
            {activeTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-[60vh] rounded-2xl overflow-hidden border border-white/5"
              >
                <MapContainer 
                  markers={allMarkers} 
                  route={allRouteCoords} 
                  center={defaultCenter} 
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Practical specs block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-8">
          <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5">
            <span className="text-gray-500 block text-[9px] uppercase font-mono tracking-wider">Language</span>
            <span className="text-gray-200 text-xs font-bold">{destinationInfo.localLanguage}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5">
            <span className="text-gray-500 block text-[9px] uppercase font-mono tracking-wider">Currency</span>
            <span className="text-gray-200 text-xs font-bold">{destinationInfo.currency}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5">
            <span className="text-gray-500 block text-[9px] uppercase font-mono tracking-wider">Best Season</span>
            <span className="text-gray-200 text-xs font-bold">{destinationInfo.bestTimeToVisit}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5">
            <span className="text-gray-500 block text-[9px] uppercase font-mono tracking-wider">Safety index</span>
            <span className="text-gray-200 text-xs font-bold">{destinationInfo.safetyTips}</span>
          </div>
        </div>

      </div>

      {/* Story Mode Full-screen overlay */}
      <AnimatePresence>
        {showStoryModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-3xl glass-panel border border-brand-gold/10 p-8 md:p-12 rounded-3xl relative overflow-y-auto max-h-[85vh] scrollbar-thin"
            >
              <button 
                onClick={() => { stopStory(); setShowStoryModal(false); }}
                className="absolute top-6 right-6 p-1.5 rounded-full border border-white/10 hover:border-brand-gold/40 text-gray-400 hover:text-white cursor-pointer transition-colors"
                aria-label="Close story panel"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] text-brand-gold font-mono uppercase tracking-widest font-bold">Folklore & Legends</span>
                    <h3 className="text-2xl md:text-3xl font-serif font-normal text-white mt-1 leading-snug">{culturalStory.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={speakStory}
                      className="px-4 py-2 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="h-4 w-4" />
                          <span>Pause Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4" />
                          <span>{isPaused ? 'Resume Voice' : 'Listen Story'}</span>
                        </>
                      )}
                    </button>
                    {(isSpeaking || isPaused) && (
                      <button
                        onClick={stopStory}
                        className="px-3 py-2 rounded-sm bg-rose-950/40 border border-rose-900 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-all duration-300 cursor-pointer"
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-gray-200 leading-relaxed font-serif text-base md:text-lg space-y-6 pt-2 select-text">
                  {culturalStory.story.split('\n\n').map((para, pIdx) => {
                    if (pIdx === 0 && para.length > 0) {
                      const firstChar = para.charAt(0);
                      const rest = para.slice(1);
                      return (
                        <p key={pIdx}>
                          <span className="float-left text-5xl md:text-6xl font-bold font-serif text-brand-gold mr-2 mt-1 leading-none">{firstChar}</span>
                          {rest}
                        </p>
                      );
                    }
                    return <p key={pIdx}>{para}</p>;
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6 text-xs text-gray-400 font-sans">
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                    <h4 className="font-bold text-gray-300 mb-1.5 uppercase font-mono tracking-wider text-[9px]">Cultural Value</h4>
                    <p className="leading-relaxed">{culturalStory.significance}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                    <h4 className="font-bold text-gray-300 mb-1.5 uppercase font-mono tracking-wider text-[9px]">Folklore Context</h4>
                    <p className="leading-relaxed">{culturalStory.historicalContext}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
