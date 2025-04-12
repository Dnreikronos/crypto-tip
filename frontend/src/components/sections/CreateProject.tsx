'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bitcoin, Coins, ArrowRight, Clipboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectPreview } from './ProjectPreview'
import { TipsInfoPanel } from './TipsInfoPanel'
import AnimatedBackground from '../ui/AnimatedBackground'
import { CryptoInfoPanel } from './CryptoInfoPanel'

type FormValues = {
  title: string;
  description: string;
  goal: string;
  walletAddr: string;
  acceptTerms: boolean;
}

export default function CreateProjectPage() {
  const [previewMode, setPreviewMode] = useState(false)
  const router = useRouter()
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      goal: '',
      walletAddr: '',
      acceptTerms: false,
    },
  })

  const formValues = form.watch()
  
  async function onSubmit(values: FormValues) {
    try {
      console.log('Project data:', values)
      
      toast.success('Project created successfully!')
      
      setTimeout(() => router.push('/creator-tip'), 1500)
    } catch (error) {
      toast.error('Failed to create project. Please try again.')
      console.error(error)
    }
  }
  
  function togglePreview() {
    setPreviewMode(!previewMode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 text-gray-100 relative overflow-hidden w-full">
        <AnimatedBackground/>
      <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
      
      <div className="container max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6 bg-card p-3 rounded-full border border-primary/20 shadow-lg">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Create Your Project Funding
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set up your crypto funding page and start receiving support from around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className={`transition-all  duration-500 ${previewMode ? 'lg:col-span-2' : ''}`}>
            {previewMode ? (
              <ProjectPreview 
                project={{
                  title: formValues.title || 'Your Amazing Project',
                  description: formValues.description || 'Project description will appear here...',
                  goal: parseFloat(formValues.goal || '0'),
                  raised: 0,
                  walletAddr: formValues.walletAddr || '0x...',
                }}
                onBack={togglePreview}
              />
            ) : (
              <div className="bg-cyan-900/10 border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white">Project Details</h2>
                  <Button 
                    onClick={togglePreview}
                    variant="ghost" 
                    className="text-white cursor-pointer"
                  >
                    Preview <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Project Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., My Web3 Game" 
                              {...field} 
                              className="bg-muted border-primary/20 text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            A catchy title helps your project stand out.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Project Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your project, its goals, and why people should support it..." 
                              className="bg-muted border-primary/20 text-foreground min-h-[120px] focus:border-primary focus:ring-primary/20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Funding Goal</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="5.0" 
                                {...field} 
                                className="bg-muted border-primary/20 text-foreground pl-10 focus:border-primary focus:ring-primary/20"
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Bitcoin className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            Set a reasonable goal to attract supporters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="walletAddr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Wallet Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="0x..." 
                                {...field} 
                                className="bg-muted border-primary/20 text-foreground pr-10 focus:border-primary focus:ring-primary/20"
                              />
                              <Button 
                                type="button"
                                variant="ghost" 
                                className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  toast.info("Paste your wallet address from clipboard")
                                }}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            Your cryptocurrency wallet address to receive funds.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-muted-foreground">
                                I agree to the terms and conditions for receiving crypto donations
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-cyan-400 text-white hover:shadow-lg transition-all px-8 py-2 cursor-pointer"
                      >
                        Create Project
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
          
          {!previewMode && (
            <div className="space-y-6">
              <TipsInfoPanel />
              <CryptoInfoPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}