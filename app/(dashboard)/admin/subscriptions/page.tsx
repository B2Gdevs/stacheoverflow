'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
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
  createdAt: string;
  updatedAt: string;
}

export default function AdminSubscriptionsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    monthlyDownloads: '',
  });

  const { data: plans, error, mutate } = useSWR<SubscriptionPlan[]>('/api/admin/subscriptions', (url) => {
    console.log('Fetching subscription plans from:', url);
    return fetch(url).then(res => {
      console.log('Subscription plans response:', res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`Failed to fetch subscription plans: ${res.status} ${res.statusText}`);
      }
      return res.json();
    });
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      monthlyDownloads: '',
    });
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setIsCreating(false);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: (plan.price / 100).toString(), // Convert from cents
      monthlyDownloads: plan.monthlyDownloads.toString(),
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      monthlyDownloads: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        monthlyDownloads: parseInt(formData.monthlyDownloads),
      };

      console.log('Submitting plan data:', planData);

      if (editingPlan) {
        // Update existing plan
        console.log('Updating existing plan:', editingPlan.id);
        const response = await fetch(`/api/admin/subscriptions/${editingPlan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });

        console.log('Update response:', response.status, response.statusText);
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Update error:', errorData);
          throw new Error('Failed to update subscription plan');
        }
      } else {
        // Create new plan
        console.log('Creating new plan');
        const response = await fetch('/api/admin/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        });

        console.log('Create response:', response.status, response.statusText);
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Create error:', errorData);
          throw new Error('Failed to create subscription plan');
        }
      }

      console.log('Plan saved successfully, refreshing data...');
      mutate(); // Refresh the data
      handleCancel();
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      alert('Failed to save subscription plan: ' + error.message);
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription plan');
      }

      mutate(); // Refresh the data
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      alert('Failed to delete subscription plan');
    }
  };

  const togglePlanStatus = async (planId: number, currentStatus: number) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: currentStatus === 1 ? 0 : 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan status');
      }

      mutate(); // Refresh the data
    } catch (error) {
      console.error('Error updating plan status:', error);
      alert('Failed to update plan status');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
          <p className="text-red-400">Error loading subscription plans: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <Button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Plan
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingPlan) && (
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Plan Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-gray-300">Monthly Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthlyDownloads" className="text-gray-300">Monthly Downloads</Label>
                  <Input
                    id="monthlyDownloads"
                    name="monthlyDownloads"
                    type="number"
                    min="1"
                    value={formData.monthlyDownloads}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe the subscription plan..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card key={plan.id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plan)}
                      className="border-green-600 text-green-400 hover:bg-green-900/20"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(plan.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-green-500">
                      ${(plan.price / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">per month</p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {plan.monthlyDownloads} downloads
                    </p>
                    <p className="text-sm text-gray-400">per month</p>
                  </div>

                  {plan.description && (
                    <p className="text-gray-300 text-sm">{plan.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      plan.isActive === 1 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                      {plan.isActive === 1 ? 'Active' : 'Inactive'}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                      className={`${
                        plan.isActive === 1
                          ? 'border-red-600 text-red-400 hover:bg-red-900/20'
                          : 'border-green-600 text-green-400 hover:bg-green-900/20'
                      }`}
                    >
                      {plan.isActive === 1 ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plans?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No subscription plans found. Create your first plan to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
