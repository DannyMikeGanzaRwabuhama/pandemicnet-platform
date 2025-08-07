"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow"
import { usePuterUser } from "@/lib/clerkPuter"
import { CheckCircle, AlertCircle, Cloud, Zap, Database, Shield, ArrowRight, Info } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = usePuterUser()
  const {
    isComplete,
    requiresOnboarding,
    isOnboarding,
    error,
    startOnboarding,
    retry,
    puterUsername
  } = useOnboardingFlow()

  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false)

  // Redirect if already onboarded
  useEffect(() => {
    if (isComplete) {
      router.push('/dashboard')
    }
  }, [isComplete, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/sign-in')
    }
  }, [user, router])

  const benefits = [
    {
      icon: <Cloud className="w-6 h-6 text-blue-500" />,
      title: "Cloud Storage",
      description: "Store and access your files from anywhere with secure cloud storage powered by Puter.com"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "AI-Powered Tools",
      description: "Access advanced AI features including chat assistance, image-to-text conversion, and intelligent file analysis"
    },
    {
      icon: <Database className="w-6 h-6 text-green-500" />,
      title: "Key-Value Storage",
      description: "Store application data and user preferences with fast, serverless key-value storage"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and remains private to your account"
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!requiresOnboarding && isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle>You&#39;re All Set!</CardTitle>
            <CardDescription>
              Your account is already connected to Puter.com services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to PandemicNet
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Hi {user?.firstName || user?.username || 'there'}! Let&#39;s set up your cloud-powered experience.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span>This will only take a minute</span>
            </div>
          </div>

          {/* Benefits Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {benefit.icon}
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Onboarding Card */}
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-t-lg">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Cloud className="w-8 h-8 text-primary" />
                Connect Your Puter.com Account
              </CardTitle>
              <CardDescription className="text-base">
                To access AI tools, cloud storage, and advanced features, you&#39;ll need a Puter.com account.
                <br />
                <strong>Don&#39;t worry—it&#39;s free and takes just a few clicks!</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              {error ? (
                <div className="mb-6 p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Setup Error
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {error}
                      </p>
                      <Button
                        onClick={retry}
                        variant="outline"
                        size="sm"
                        className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">What happens next?</h3>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Click &#34;Get Started&#34; to open Puter.com&#39;s secure sign-up
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Create your free Puter.com account (or sign in if you have one)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        We&#39;ll automatically link it to your PandemicNet account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <Button
                    onClick={startOnboarding}
                    disabled={isOnboarding}
                    size="lg"
                    className="px-8 py-3 text-lg font-medium"
                  >
                    {isOnboarding ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Setting up your account...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowBenefitsDialog(true)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Learn more about these features
                    </Button>
                  </div>
                </div>

                {puterUsername && (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Successfully connected as <strong>{puterUsername}</strong>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>
              By continuing, you agree to Puter.com&#39;s{' '}
              <a href="https://puter.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://puter.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Dialog */}
      <Dialog open={showBenefitsDialog} onOpenChange={setShowBenefitsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Why Connect to Puter.com?</DialogTitle>
            <DialogDescription>
              Discover the powerful features you&#39;ll unlock with your Puter.com account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-1">{benefit.title}</h4>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-base mb-2">Additional Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No credit card required - free tier includes generous usage limits</li>
                <li>• Cross-device synchronization for all your data</li>
                <li>• Regular feature updates and improvements</li>
                <li>• Community support and documentation</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
