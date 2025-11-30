'use client';

import { useState, useEffect } from 'react';
import { Plus, Gift, Calendar, Users, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';

interface PromoCode {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number | null;
  assetId: number | null;
  assetType: string;
  maxUses: number | null;
  usesCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: number;
  createdAt: string;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'free_asset',
    discountValue: null as number | null,
    assetId: '',
    assetType: 'beat',
    maxUses: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch('/api/admin/promos');
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/admin/promos', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          assetId: formData.assetId ? parseInt(formData.assetId) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          validUntil: formData.validUntil || null,
        }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Promo code created successfully!',
        });
        setShowCreateForm(false);
        setFormData({
          code: '',
          description: '',
          discountType: 'free_asset',
          discountValue: null,
          assetId: '',
          assetType: 'beat',
          maxUses: '',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: '',
        });
        fetchPromoCodes();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          description: error.error || 'Failed to create promo code',
        });
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create promo code',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    try {
      const response = await fetch(`/api/admin/promos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: currentStatus === 1 ? 0 : 1 }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          description: `Promo code ${currentStatus === 1 ? 'deactivated' : 'activated'}`,
        });
        fetchPromoCodes();
      }
    } catch (error) {
      console.error('Error updating promo code:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={cn(getIconSize('lg'), "animate-spin text-green-400")} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Promo Codes</h1>
          <p className="text-gray-400">Create and manage promo codes for free assets</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-500 hover:bg-green-600"
        >
          <Plus className={cn(getIconSize('sm'), "mr-2")} />
          Create Promo Code
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create New Promo Code</CardTitle>
            <CardDescription className="text-gray-400">
              Create a promo code to unlock free assets for users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Code *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="bg-black border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
                >
                  <option value="free_asset">Free Asset</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Asset ID * (for free_asset)
                </label>
                <Input
                  type="number"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  placeholder="123"
                  className="bg-black border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Asset Type *
                </label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
                >
                  <option value="beat">Beat</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer promotion"
                  className="bg-black border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Max Uses (leave empty for unlimited)
                </label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                  className="bg-black border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Valid From *
                </label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="bg-black border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Valid Until (leave empty for no expiration)
                </label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="bg-black border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || !formData.code || !formData.assetId}
                className="bg-green-500 hover:bg-green-600"
              >
                {isCreating ? (
                  <>
                    <Loader2 className={cn(getIconSize('sm'), "mr-2 animate-spin")} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className={cn(getIconSize('sm'), "mr-2")} />
                    Create
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.map((promo) => (
          <Card key={promo.id} className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-mono text-lg">{promo.code}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(promo.id, promo.isActive)}
                  className={cn(
                    "h-8 w-8",
                    promo.isActive === 1 ? "text-green-400" : "text-gray-500"
                  )}
                >
                  {promo.isActive === 1 ? (
                    <Check className={getIconSize('sm')} />
                  ) : (
                    <X className={getIconSize('sm')} />
                  )}
                </Button>
              </div>
              {promo.description && (
                <CardDescription className="text-gray-400">{promo.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Gift className={getIconSize('sm')} />
                <span>{promo.discountType === 'free_asset' ? 'Free Asset' : `${promo.discountValue}%`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users className={getIconSize('sm')} />
                <span>{promo.usesCount} / {promo.maxUses || '∞'} uses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className={getIconSize('sm')} />
                <span>
                  {new Date(promo.validFrom).toLocaleDateString()}
                  {promo.validUntil && ` - ${new Date(promo.validUntil).toLocaleDateString()}`}
                </span>
              </div>
              {promo.assetId && (
                <div className="text-xs text-gray-400">
                  Asset ID: {promo.assetId} ({promo.assetType})
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {promoCodes.length === 0 && (
        <div className="text-center py-12">
          <Gift className={cn(getIconSize('xl'), "mx-auto text-gray-500 mb-4")} />
          <p className="text-gray-400">No promo codes created yet</p>
        </div>
      )}
    </div>
  );
}

