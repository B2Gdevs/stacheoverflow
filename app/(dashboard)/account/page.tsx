'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Mail, User as UserIcon, Shield, Camera } from 'lucide-react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { fetcher, CACHE_KEYS } from '@/lib/swr/config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { AvatarUploadDialog } from '@/components/account/avatar-upload-dialog';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { data: currentUser, error, isLoading, mutate } = useSWR<User>(CACHE_KEYS.USER, fetcher);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Debug: Log user data when it changes
  React.useEffect(() => {
    if (currentUser) {
      console.log('👤 Account page - Current user data:', {
        id: currentUser.id,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
      });
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-gray-400">Loading account information...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-gray-900 border-gray-700 max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-400 text-center">Failed to load account information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your account information and preferences</p>
      </div>

      {/* Profile Information Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BadgeCheck className={getIconSize('md')} />
            Profile Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar key={currentUser.avatarUrl || 'no-avatar'} className="h-20 w-20">
                <AvatarImage 
                  src={currentUser.avatarUrl || '/avatars/stacho.jpg'} 
                  alt={currentUser.name || currentUser.email}
                  onError={(e) => {
                    console.error('Failed to load avatar image:', currentUser.avatarUrl);
                    e.currentTarget.src = '/avatars/stacho.jpg';
                  }}
                />
                <AvatarFallback className="text-lg">
                  {currentUser.name
                    ? currentUser.name.split(' ').map((n: string) => n[0]).join('')
                    : currentUser.email.split('@')[0][0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white border-2 border-gray-900"
                onClick={() => setUploadDialogOpen(true)}
                title="Upload profile picture"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">
                {currentUser.name || 'User'}
              </h3>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className={getIconSize('sm')} />
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1 block">Name</label>
              <p className="text-white">{currentUser.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1 block">Email</label>
              <p className="text-white">{currentUser.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1 block">Role</label>
              <div className="flex items-center gap-2">
                <span className="text-white capitalize">{currentUser.role || 'member'}</span>
                {currentUser.role === 'admin' && (
                  <Shield className={`${getIconSize('sm')} text-green-400`} />
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1 block">Account Created</label>
              <p className="text-white">
                {currentUser.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserIcon className={getIconSize('md')} />
            Account Actions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Account management features will be available here soon. You can update your profile
              information, change your password, and manage your account preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      <AvatarUploadDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          // Refresh user data when dialog closes (in case avatar was updated)
          if (!open) {
            mutate();
          }
        }}
        currentAvatarUrl={currentUser.avatarUrl}
      />
    </div>
  );
}

