'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { cn } from '@/lib/utils';
import { useBeatPacks } from '@/lib/swr/hooks';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EditPackListPage() {
  const router = useRouter();
  const { packs, isLoading, refresh } = useBeatPacks();
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const filteredPacks = packs.filter(pack => 
    !searchQuery || 
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (packId: number, packName: string) => {
    if (!confirm(`Are you sure you want to delete "${packName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Get Supabase session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/beat-packs/${packId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Pack Deleted',
          description: `"${packName}" has been deleted successfully.`,
        });
        refresh();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Error',
          description: error.error || 'Failed to delete pack',
        });
      }
    } catch (error) {
      console.error('Error deleting pack:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete pack',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={cn(getIconSize('lg'), "animate-spin text-green-400")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Beat Packs</h1>
          <p className="text-gray-400">Create and manage beat packs</p>
        </div>
        <Link href="/admin/upload">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className={cn(getIconSize('sm'), "mr-2")} />
            Create New Pack
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={cn(getIconSize('sm'), "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400")} />
        <Input
          type="text"
          placeholder="Search packs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black border-gray-600 text-white"
        />
      </div>

      {/* Packs Grid */}
      {filteredPacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPacks.map((pack) => (
            <Card 
              key={pack.id} 
              className={cn(
                "bg-gray-900 border-gray-700 transition-all",
                "hover:border-gray-600 hover:shadow-lg cursor-pointer"
              )}
              onClick={() => router.push(`/admin/edit-pack/${pack.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-1">{pack.name}</CardTitle>
                    {pack.artist && (
                      <CardDescription className="text-gray-400">by {pack.artist}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pack.id, pack.name);
                      }}
                      className="h-8 w-8 text-gray-400 hover:text-red-400"
                      title="Delete pack"
                    >
                      <Trash2 className={getIconSize('sm')} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Package className={getIconSize('sm')} />
                  <span>{pack.beats?.length || 0} beats</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400 font-semibold">${pack.price}</span>
                </div>
                {pack.published ? (
                  <div className="text-xs text-green-400">Published</div>
                ) : (
                  <div className="text-xs text-gray-500">Draft</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className={cn(getIconSize('xl'), "mx-auto text-gray-500 mb-4")} />
              <p className="text-gray-400">
                {searchQuery ? 'No packs found matching your search' : 'No beat packs created yet'}
              </p>
              {!searchQuery && (
                <Link href="/admin/upload">
                  <Button className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                    <Plus className={cn(getIconSize('sm'), "mr-2")} />
                    Create Your First Pack
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

