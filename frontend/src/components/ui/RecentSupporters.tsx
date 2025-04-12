"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Supporter {
  id: string;
  name: string;
  avatar: string;
  amount: string;
  currency: string;
  message: string;
  timeAgo: string;
}

export default function RecentSupporters() {
  const supporters: Supporter[] = [
    {
      id: '1',
      name: 'Alex',
      avatar: 'A',
      amount: '0.25 ETH',
      currency: 'eth',
      message: '"Love your work on the FileSync API!"',
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      name: 'Maria',
      avatar: 'M',
      amount: '0.5 BTC',
      currency: 'btc',
      message: '"Keep building awesome stuff!"',
      timeAgo: '1 day ago'
    },
    {
      id: '3',
      name: 'Satoshi',
      avatar: 'S',
      amount: '1 ETH',
      currency: 'eth',
      message: '"Your components saved me weeks of work"',
      timeAgo: '3 days ago'
    },
    {
      id: '4',
      name: 'CryptoWhale',
      avatar: 'C',
      amount: '5 ETH',
      currency: 'eth',
      message: '',
      timeAgo: '1 week ago'
    }
  ];
  
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Recent Supporters</h2>
      
      <div className="space-y-4">
        {supporters.map(supporter => (
          <div key={supporter.id} className="flex items-start gap-3">
            <Avatar className="h-10 w-10 bg-gray-800 text-white">
              <AvatarFallback>{supporter.avatar}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{supporter.name}</span>
                <span className="text-xs text-gray-400">{supporter.timeAgo}</span>
              </div>
              <p className={`text-sm ${supporter.currency === 'eth' ? 'text-cyan-400' : supporter.currency === 'btc' ? 'text-yellow-400' : 'text-green-400'}`}>
                {supporter.amount}
              </p>
              {supporter.message && (
                <p className="text-sm text-gray-300 mt-1">{supporter.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}