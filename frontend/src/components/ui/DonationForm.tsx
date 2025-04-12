"use client";

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function DonationForm() {
  const [amount, setAmount] = useState(50);
  const [currency, setCurrency] = useState('ethereum');
  const [showPublicly, setShowPublicly] = useState(true);
  
  const usdEquivalent = currency === 'ethereum' ? amount * 30 : 
                         currency === 'bitcoin' ? amount * 60000 : 
                         amount * 100;
  
  function handleSend() {
    console.log('Sending tip:', { amount, currency, showPublicly });
  }
  
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Support DevJane</h2>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-2">Donation Amount</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">{amount}</span>
            <span className="text-lg px-2 py-1 rounded bg-cyan-900 text-cyan-400">{currency === 'ethereum' ? 'ETH' : currency === 'bitcoin' ? 'BTC' : 'SOL'}</span>
            <span className="text-gray-400">≈ ${usdEquivalent.toLocaleString()}</span>
          </div>
          
          <div className="my-4">
            <Slider 
              value={[amount]} 
              min={5}
              max={500}
              step={1}
              onValueChange={(vals) => setAmount(vals[0])}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 {currency === 'ethereum' ? 'ETH' : currency === 'bitcoin' ? 'BTC' : 'SOL'}</span>
              <span>500 {currency === 'ethereum' ? 'ETH' : currency === 'bitcoin' ? 'BTC' : 'SOL'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-3">Select Cryptocurrency</p>
          <div className="grid grid-cols-3 gap-3">
            <button 
              className={` cursor-pointer p-4 rounded-lg border ${currency === 'bitcoin' ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 bg-gray-800'} flex flex-col items-center gap-2`}
              onClick={() => setCurrency('bitcoin')}
            >
              <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-lg">₿</span>
              </div>
              <span className="text-sm">Bitcoin</span>
            </button>
            
            <button 
              className={`cursor-pointer p-4 rounded-lg border ${currency === 'ethereum' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800'} flex flex-col items-center gap-2`}
              onClick={() => setCurrency('ethereum')}
            >
              <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-lg">Ξ</span>
              </div>
              <span className="text-sm">Ethereum</span>
            </button>
            
            <button 
              className={`cursor-pointer p-4 rounded-lg border ${currency === 'solana' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800'} flex flex-col items-center gap-2`}
              onClick={() => setCurrency('solana')}
            >
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-lg">◎</span>
              </div>
              <span className="text-sm">Solana</span>
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-400">Leave a Message (Optional)</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show publicly</span>
              <Switch 
                checked={showPublicly} 
                onCheckedChange={setShowPublicly}
              />
            </div>
          </div>
          
          <Textarea 
            placeholder="Write a message of support..."
            className="bg-gray-800 border-gray-700 resize-none h-24"
          />
        </div>
        
        <Button 
          onClick={handleSend}
          className=" cursor-pointer w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity"
        >
          Send {amount} {currency === 'ethereum' ? 'ETH' : currency === 'bitcoin' ? 'BTC' : 'SOL'} Tip
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure transaction via blockchain</span>
        </div>
      </div>
    </div>
  );
}