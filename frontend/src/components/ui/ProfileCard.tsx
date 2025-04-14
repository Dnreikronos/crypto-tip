"use client";

import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

export default function ProfileCard() {
  return (
    <div className="bg-gray-900 rounded-lg p-6 text-center flex flex-col items-center">
      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-800 mb-3">
        <Image 
          src="/avatar-placeholder.png" 
          alt="DevJane's profile" 
          fill
          className="object-cover"
          sizes="96px"
          priority
        />
      </div>
      
      <h2 className="text-2xl font-bold">DevJane</h2>
      <p className="text-cyan-400">@dev_jane</p>
      
      <div className="flex gap-2 my-3">
        <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium">Developer</span>
        <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-medium">Open Source</span>
      </div>
      
      <p className="text-sm text-gray-300 mb-6">
        Building open-source tools and libraries that help developers create beautiful interfaces faster. Currently working on a new React component library.
      </p>
      
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span>245 ETH</span>
          <span>of 500 ETH</span>
        </div>
        <Progress value={49} className="h-2 bg-gray-800">
          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
        </Progress>
        <p className="text-xs text-gray-400">49% funded of monthly goal</p>
      </div>
    </div>
  );
}