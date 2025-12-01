'use client';

import { useState, useEffect } from 'react';
import { Plus, Gift, Calendar, Users, X, Check, Loader2, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import { useBeats, useBeatPacks } from '@/lib/swr/hooks';

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
  const [assetSearch, setAssetSearch] = useState('');
  const { addToast } = useToast();
  const { beats = [], isLoading: beatsLoading } = useBeats();
  const { packs = [], isLoading: packsLoading } = useBeatPacks();

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
    setLoading(true);
    try {
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/admin/promos', {
        headers,
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      } else {
        console.error('Failed to fetch promo codes');
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

      const url = editingPromo ? `/api/admin/promos/${editingPromo.id}` : '/api/admin/promos';
      const method = editingPromo ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
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
          description: editingPromo ? 'Promo code updated successfully!' : 'Promo code created successfully!',
        });
        setShowCreateForm(false);
        setEditingPromo(null);
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
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/admin/promos/${id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
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

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      assetId: promo.assetId?.toString() || '',
      assetType: promo.assetType,
      maxUses: promo.maxUses?.toString() || '',
      validFrom: new Date(promo.validFrom).toISOString().split('T')[0],
      validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : '',
    });
    setShowCreateForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) {
      return;
    }

    try {
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/admin/promos/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Promo code deleted successfully',
        });
        fetchPromoCodes();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          description: error.error || 'Failed to delete promo code',
        });
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete promo code',
      });
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
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            if (showCreateForm) {
              setEditingPromo(null);
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
            }
          }}
          className="bg-green-500 hover:bg-green-600"
        >
          <Plus className={cn(getIconSize('sm'), "mr-2")} />
          {showCreateForm ? 'Cancel' : 'Create Promo Code'}
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
                  Asset Type *
                </label>
                <select
                  value={formData.assetType}
                  onChange={(e) => {
                    setFormData({ ...formData, assetType: e.target.value, assetId: '' });
                    setAssetSearch('');
                  }}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
                >
                  <option value="beat">Beat</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              {formData.discountType === 'free_asset' && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Select {formData.assetType === 'beat' ? 'Beat' : 'Pack'} (leave empty to unlock all assets)
                  </label>
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, assetId: '' });
                        setAssetSearch('');
                      }}
                      className={cn(
                        "text-sm px-3 py-1 rounded-md border transition-colors",
                        !formData.assetId 
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                      )}
                    >
                      Unlock All Assets
                    </button>
                  </div>
                  <div className="relative">
                    <Search className={cn(getIconSize('sm'), "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400")} />
                    <Input
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      placeholder={`Search ${formData.assetType === 'beat' ? 'beats' : 'packs'}...`}
                      className="bg-black border-gray-600 text-white pl-10"
                    />
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto bg-gray-800 rounded-md border border-gray-700">
                    {formData.assetType === 'beat' ? (
                      beatsLoading ? (
                        <div className="p-4 text-center text-gray-400">Loading beats...</div>
                      ) : (
                        beats
                          .filter(beat => 
                            !assetSearch || 
                            beat.title.toLowerCase().includes(assetSearch.toLowerCase()) ||
                            beat.artist?.toLowerCase().includes(assetSearch.toLowerCase())
                          )
                          .slice(0, 20)
                          .map(beat => (
                            <button
                              key={beat.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, assetId: beat.id.toString() });
                                setAssetSearch(beat.title);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors",
                                formData.assetId === beat.id.toString() && "bg-green-500/20 border-l-2 border-green-500"
                              )}
                            >
                              <div className="text-white text-sm font-medium">{beat.title}</div>
                              {beat.artist && (
                                <div className="text-gray-400 text-xs">by {beat.artist}</div>
                              )}
                              <div className="text-gray-500 text-xs">ID: {beat.id} • ${beat.price}</div>
                            </button>
                          ))
                      )
                    ) : (
                      packsLoading ? (
                        <div className="p-4 text-center text-gray-400">Loading packs...</div>
                      ) : (
                        packs
                          .filter(pack => 
                            !assetSearch || 
                            pack.name.toLowerCase().includes(assetSearch.toLowerCase())
                          )
                          .slice(0, 20)
                          .map(pack => (
                            <button
                              key={pack.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, assetId: pack.id.toString() });
                                setAssetSearch(pack.name);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors",
                                formData.assetId === pack.id.toString() && "bg-green-500/20 border-l-2 border-green-500"
                              )}
                            >
                              <div className="text-white text-sm font-medium">{pack.name}</div>
                              <div className="text-gray-500 text-xs">ID: {pack.id} • ${pack.price}</div>
                            </button>
                          ))
                      )
                    )}
                    {formData.assetId && (
                      <div className="p-2 border-t border-gray-700 bg-gray-900">
                        <div className="text-xs text-gray-400">
                          Selected: {formData.assetType === 'beat' 
                            ? beats.find(b => b.id.toString() === formData.assetId)?.title || `Beat ID: ${formData.assetId}`
                            : packs.find(p => p.id.toString() === formData.assetId)?.name || `Pack ID: ${formData.assetId}`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                disabled={isCreating || !formData.code}
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
                    {editingPromo ? 'Update' : 'Create'}
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
          <Card 
            key={promo.id} 
            className={cn(
              "bg-gray-900 border-gray-700 transition-all",
              "hover:border-gray-600 hover:shadow-lg cursor-pointer"
            )}
            onClick={() => handleEdit(promo)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-mono text-lg">{promo.code}</CardTitle>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(promo.id);
                    }}
                    className="h-8 w-8 text-gray-400 hover:text-red-400"
                    title="Delete promo code"
                  >
                    <Trash2 className={getIconSize('sm')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(promo.id, promo.isActive);
                    }}
                    className={cn(
                      "h-8 w-8",
                      promo.isActive === 1 ? "text-green-400" : "text-gray-500"
                    )}
                    title={promo.isActive === 1 ? "Deactivate" : "Activate"}
                  >
                    {promo.isActive === 1 ? (
                      <Check className={getIconSize('sm')} />
                    ) : (
                      <X className={getIconSize('sm')} />
                    )}
                  </Button>
                </div>
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
              {promo.assetId ? (
                <div className="text-xs text-gray-400">
                  Asset ID: {promo.assetId} ({promo.assetType})
                </div>
              ) : (
                <div className="text-xs text-green-400 font-medium">
                  ✓ Unlocks all {promo.assetType === 'beat' ? 'beats' : 'packs'}
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

