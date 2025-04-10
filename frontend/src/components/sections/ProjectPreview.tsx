'use client'

import { ArrowLeft, Bitcoin, Share2, Clipboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ProjectPreviewProps {
  project: {
    title: string;
    description: string;
    goal: number;
    raised: number;
    walletAddr: string;
  };
  onBack: () => void;
}

export function ProjectPreview({ project, onBack }: ProjectPreviewProps) {
  const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0;
  
  function copyToClipboard() {
    navigator.clipboard.writeText(project.walletAddr)
      .then(() => {
        toast.success("Wallet address copied to clipboard")
      })
      .catch(() => {
        toast.error("Failed to copy address")
      })
  }
  
  return (
    <div className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="text-primary hover:text-primary-foreground hover:bg-primary/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
        </Button>
        
        <Button 
          variant="outline" 
          className="text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            toast.info("Share link copied to clipboard")
          }}
        >
          <Share2 className="mr-2 h-4 w-4" /> Share Preview
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-card-foreground">{project.title}</h1>
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground mb-6 whitespace-pre-line">
            {project.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-muted p-6 rounded-xl border border-primary/10 flex flex-col items-center justify-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Goal</p>
          <p className="text-2xl font-bold text-card-foreground flex items-center">
            <Bitcoin className="h-5 w-5 text-cyan-400 mr-2" />
            {project.goal.toFixed(2)} ETH
          </p>
        </div>
        
        <div className="bg-muted p-6 rounded-xl border border-primary/10 flex flex-col items-center justify-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Raised</p>
          <p className="text-2xl font-bold text-primary flex items-center">
            <Bitcoin className="h-5 w-5 text-cyan-400 mr-2" />
            {project.raised.toFixed(2)} ETH
          </p>
        </div>
        
        <div className="bg-muted p-6 rounded-xl border border-primary/10 flex flex-col items-center justify-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Progress</p>
          <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
          <div className="w-full bg-muted-foreground/30 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-cyan-400 h-full rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-card-foreground">Support This Project</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0.01, 0.05, 0.1, 0.5].map((amount) => (
            <button
              key={amount}
              className="bg-muted border border-primary/20 rounded-lg py-3 px-4 text-card-foreground hover:bg-primary/10 hover:border-primary/40 transition-all"
              onClick={() => {
                toast.info(`Selected ${amount} ETH donation`)
              }}
            >
              <span className="block text-lg font-semibold">{amount} ETH</span>
              <span className="text-xs text-muted-foreground">Support</span>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button 
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-400 text-white rounded-lg py-3 font-medium hover:shadow-lg transition-all"
            onClick={() => {
              toast.info("Donation process would start here")
            }}
          >
            Donate Now
          </button>
        </div>
      </div>
      
      <div className="bg-muted rounded-xl p-6 border border-primary/10 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Wallet Address</h3>
        <div className="flex items-center justify-between bg-background p-3 rounded-lg border border-border">
          <code className="text-sm text-muted-foreground font-mono truncate">
            {project.walletAddr}
          </code>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={copyToClipboard}
          >
            <span className="sr-only">Copy address</span>
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Send ETH to this address to support the project directly
        </p>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        <p>This is a preview of how your project page will look</p>
      </div>
    </div>
  );
}