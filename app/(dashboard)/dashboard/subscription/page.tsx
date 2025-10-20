'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Download, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import useSWR from 'swr';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  monthlyDownloads: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
  isActive: number;
}

interface UserSubscription {
  subscription: {
    id: number;
    userId: number;
    planId: number;
    stripeSubscriptionId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    downloadsUsed: number;
    downloadsResetAt: string;
  };
  plan: SubscriptionPlan;
}

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: plans, error: plansError } = useSWR<SubscriptionPlan[]>('/api/subscriptions');
  const { data: userSubscription, error: subscriptionError } = useSWR<UserSubscription>('/api/user/subscription');

  const handleSubscribe = async (planId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription checkout');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to downloads at the end of your current billing period.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/subscription', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      alert('Subscription canceled successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  if (plansError || subscriptionError) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Subscription</h1>
          <p className="text-red-400">Error loading subscription data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscription</h1>

        {/* Current Subscription Status */}
        {userSubscription && (
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {userSubscription.plan.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {userSubscription.plan.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {userSubscription.subscription.status === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      userSubscription.subscription.status === 'active' 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {userSubscription.subscription.status.charAt(0).toUpperCase() + userSubscription.subscription.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Downloads</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Used this month:</span>
                      <span className="text-white">{userSubscription.subscription.downloadsUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly limit:</span>
                      <span className="text-white">{userSubscription.plan.monthlyDownloads}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((userSubscription.subscription.downloadsUsed / userSubscription.plan.monthlyDownloads) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Billing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Price:</span>
                      <span className="text-white">${(userSubscription.plan.price / 100).toFixed(2)}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Next billing:</span>
                      <span className="text-white">
                        {new Date(userSubscription.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Downloads reset:</span>
                      <span className="text-white">
                        {new Date(userSubscription.subscription.downloadsResetAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {userSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-gray-900 border-gray-700 ${
                  userSubscription?.plan.id === plan.id 
                    ? 'ring-2 ring-green-500' 
                    : 'hover:border-green-500'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {plan.name}
                    {userSubscription?.plan.id === plan.id && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </CardTitle>
                  {plan.description && (
                    <p className="text-gray-300 text-sm">{plan.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-green-500">
                        ${(plan.price / 100).toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">per month</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-green-500" />
                        <span className="text-white">{plan.monthlyDownloads} downloads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-white">Monthly reset</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-500" />
                        <span className="text-white">Cancel anytime</span>
                      </div>
                    </div>

                    {userSubscription?.plan.id !== plan.id && (
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isLoading ? 'Processing...' : 'Subscribe'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Why Subscribe?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Monthly Downloads</h3>
                <p className="text-gray-300">
                  Get a set number of high-quality beat downloads every month
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Flexible Billing</h3>
                <p className="text-gray-300">
                  Cancel or change your plan anytime with no long-term commitment
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Premium Access</h3>
                <p className="text-gray-300">
                  Access to exclusive beats and early releases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
