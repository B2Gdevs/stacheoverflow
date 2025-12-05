'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, ExternalLink, Headphones, Share2, Sparkles, Radio, Move, X } from 'lucide-react';
import Image from 'next/image';

// Social Icon Components
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.299.18-.599.479-.719 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SoundCloudIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.175 13.5c-.64 0-1.175.535-1.175 1.175 0 .641.535 1.175 1.175 1.175h1.175v-2.35H1.175zm2.35-2.35c-.64 0-1.175.535-1.175 1.175v3.525c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175v-3.525c0-.64-.534-1.175-1.175-1.175zm2.35-2.35c-.64 0-1.175.535-1.175 1.175v6.225c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V9.975c0-.64-.534-1.175-1.175-1.175zm2.35-2.35c-.64 0-1.175.535-1.175 1.175v8.575c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V7.625c0-.64-.534-1.175-1.175-1.175zm2.35-1.175c-.64 0-1.175.535-1.175 1.175v9.75c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V6.45c0-.64-.534-1.175-1.175-1.175zm2.35-1.175c-.64 0-1.175.535-1.175 1.175v10.925c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V5.275c0-.64-.534-1.175-1.175-1.175zm2.35-1.175c-.64 0-1.175.535-1.175 1.175v12.1c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V4.1c0-.64-.534-1.175-1.175-1.175zm2.35-1.175c-.64 0-1.175.535-1.175 1.175v13.275c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V2.925c0-.64-.534-1.175-1.175-1.175zm2.35-1.175c-.64 0-1.175.535-1.175 1.175v14.45c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V1.75c0-.64-.534-1.175-1.175-1.175zm2.35 0c-.64 0-1.175.535-1.175 1.175v14.45c0 .64.535 1.175 1.175 1.175.641 0 1.175-.535 1.175-1.175V1.75c0-.64-.534-1.175-1.175-1.175z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SETTING_KEY = 'about-banner-position';

interface ImagePosition {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

export default function AboutPage() {
  const [isDev, setIsDev] = useState(false);
  const [showPositionTool, setShowPositionTool] = useState(false);
  const [position, setPosition] = useState<ImagePosition>({ x: 0, y: 50 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if we're in dev mode (client-side check)
  useEffect(() => {
    const checkDev = () => {
      // Check multiple ways to determine dev mode
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const isDevEnv = process.env.NODE_ENV === 'development';
      setIsDev(isLocalhost || isDevEnv);
    };
    checkDev();
  }, []);

  // Load saved position from server
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const response = await fetch(`/api/site-settings?key=${SETTING_KEY}`, {
          credentials: 'include', // Important: include cookies for auth
        });
        const data = await response.json();
        
        if (data.value && typeof data.value === 'object') {
          setPosition(data.value);
        }
      } catch (error) {
        console.error('Failed to load banner position:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosition();
  }, []);

  // Save position to server (dev mode only)
  const savePosition = async (newPosition: ImagePosition) => {
    setPosition(newPosition);
    
    if (isDev) {
      try {
        const response = await fetch('/api/site-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: include cookies for auth
          body: JSON.stringify({
            key: SETTING_KEY,
            value: newPosition,
            description: 'Banner image position for about page',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to save position:', error);
        }
      } catch (error) {
        console.error('Error saving position:', error);
      }
    }
  };

  const objectPosition = `${position.x}% ${position.y}%`;
  const streamingPlatforms = [
    {
      name: 'Spotify',
      url: 'https://open.spotify.com/artist/51mRxz40n0c8cmBgC68X7o',
      icon: SpotifyIcon,
      color: 'from-green-500 to-emerald-600',
    },
    {
      name: 'YouTube Music',
      url: 'https://music.youtube.com/channel/UCnVv7NeQGjYULo4yVCxBaLQ',
      icon: YouTubeIcon,
      color: 'from-red-500 to-rose-600',
    },
    {
      name: 'SoundCloud',
      url: 'https://soundcloud.com/stacheoverflow',
      icon: SoundCloudIcon,
      color: 'from-orange-500 to-amber-600',
    },
  ];

  const socialMedia = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/stacho_0/',
      icon: InstagramIcon,
      color: 'from-pink-500 to-rose-600',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@stacheoverflow',
      icon: TikTokIcon,
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Dev-only Position Tool */}
      {isDev && (
        <>
          <Button
            onClick={() => setShowPositionTool(!showPositionTool)}
            className="fixed top-20 right-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg"
            size="sm"
          >
            <Move className="h-4 w-4 mr-2" />
            Position Image
          </Button>
          
          {showPositionTool && (
            <Card className="fixed top-32 right-4 z-50 w-80 bg-gray-900 border-2 border-yellow-500 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-lg">Image Position (Dev Only)</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPositionTool(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Horizontal (X): {position.x}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.x}
                    onChange={(e) => savePosition({ ...position, x: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Vertical (Y): {position.y}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.y}
                    onChange={(e) => savePosition({ ...position, y: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const reset = { x: 0, y: 50 };
                      setPosition(reset);
                      savePosition(reset);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={async () => {
                      setPosition({ x: 0, y: 50 });
                      if (isDev) {
                        await savePosition({ x: 0, y: 50 });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Reset & Save
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Position: {objectPosition}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Hero Section with Banner */}
      <div className="relative w-full mb-8 overflow-hidden">
        <div className="relative h-64 md:h-80 lg:h-96 w-full">
          <Image
            src="/images/my_artist_banner.png"
            alt="StachO Artist Banner"
            fill
            className="object-cover"
            style={{ objectPosition }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                Stach<span className="text-green-400">O</span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-300 drop-shadow-md">
              Music Producer & Artist
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="grid gap-8">
          {/* Artist Bio Card - Enhanced */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-green-500/20 shadow-2xl shadow-green-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-2xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Music className="h-6 w-6 text-green-400" />
                </div>
                Artist Bio
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Get to know the artist behind the music
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-200 leading-relaxed text-lg">
                Welcome! I'm <span className="text-green-400 font-semibold">StachO</span>, a music producer and artist passionate about creating unique beats 
                and tracks. Through this platform, I share my work with the world and connect with fellow 
                music enthusiasts and creators.
              </p>
              <p className="text-gray-200 leading-relaxed text-lg">
                My music spans various genres, blending elements from hip-hop, electronic, and ambient 
                sounds to create something truly distinctive. Each track is crafted with care and attention 
                to detail, ensuring a quality listening experience.
              </p>
              <p className="text-gray-200 leading-relaxed text-lg">
                Feel free to follow and connect! Looking forward to interacting with you on any platform 😊
              </p>
            </CardContent>
          </Card>

          {/* Spotify Playlist Embed - Featured */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-green-500/30 shadow-2xl shadow-green-500/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <CardTitle className="text-white flex items-center gap-3 text-2xl">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <Headphones className="h-6 w-6 text-green-400" />
                </div>
                Sync Rep Playlist
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Curated playlist for sync representatives - Stream directly below!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
                <iframe
                  src="https://open.spotify.com/embed/playlist/5zJZ7x0bMZCWfcKWgnskaa?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-lg"
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Radio className="h-4 w-4 text-green-400" />
                <span>Stream directly in the app or open in Spotify</span>
              </div>
            </CardContent>
          </Card>

          {/* Streaming Platforms - Enhanced */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-2xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ExternalLink className="h-6 w-6 text-blue-400" />
                </div>
                Stream My Music
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Find my music on your favorite streaming platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streamingPlatforms.map((platform) => (
                  <div
                    key={platform.name}
                    className={`w-full bg-gradient-to-br ${platform.color} rounded-lg border-0 text-white hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl overflow-hidden`}
                  >
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5"
                    >
                      <platform.icon className="w-12 h-12 text-white" />
                      <div className="flex flex-col items-start flex-1">
                        <span className="font-bold text-lg">{platform.name}</span>
                        <span className="text-xs text-white/80">Listen now</span>
                      </div>
                      <ExternalLink className="h-5 w-5 ml-auto" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media - Enhanced */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-2xl">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Share2 className="h-6 w-6 text-pink-400" />
                </div>
                Social Media
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Connect with me on social platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialMedia.map((platform) => (
                  <div
                    key={platform.name}
                    className={`w-full bg-gradient-to-br ${platform.color} rounded-lg border-0 text-white hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl overflow-hidden`}
                  >
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5"
                    >
                      <platform.icon className="w-12 h-12 text-white" />
                      <div className="flex flex-col items-start flex-1">
                        <span className="font-bold text-lg">{platform.name}</span>
                        <span className="text-xs text-white/80">Follow me</span>
                      </div>
                      <ExternalLink className="h-5 w-5 ml-auto" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connect Card - Enhanced */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-green-500/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Let's Connect</CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Stay connected and get updates on new releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 text-lg leading-relaxed">
                Follow me on social media and streaming platforms to stay updated with my latest releases, 
                behind-the-scenes content, and upcoming projects. Your support means everything! 🎵✨
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
