import { Suspense } from 'react';
import ProfileCard from '@/components/ui/ProfileCard';
import SupportForm from '@/components/ui/DonationForm';
import RecentSupporters from '@/components/ui/RecentSupporters';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function DonationPage() {
  return (
    <div className="pt-20 pb-16 w-full bg-black text-white relative">
      <AnimatedBackground />
      
      <div className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Support Open-Source Development
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Suspense fallback={<div className="h-80 bg-gray-900/60 rounded-lg animate-pulse"></div>}>
              <ProfileCard />
            </Suspense>
            
            <Suspense fallback={<div className="h-60 bg-gray-900/60 rounded-lg animate-pulse"></div>}>
              <RecentSupporters />
            </Suspense>
          </div>
          
          <div className="lg:col-span-8 space-y-6">
            <Suspense fallback={<div className="h-96 bg-gray-900/60 rounded-lg animate-pulse"></div>}>
              <SupportForm />
            </Suspense>
            
          </div>
        </div>
      </div>
    </div>
  );
}