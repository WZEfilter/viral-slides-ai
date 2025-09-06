import { useState } from 'react';

export interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  accounts: PlatformAccount[];
  capabilities: {
    canPublish: boolean;
    canSchedule: boolean;
    maxAccounts: number;
  };
}

export interface PlatformAccount {
  id: string;
  username: string;
  profilePicture: string;
  isActive: boolean;
}

export const usePlatforms = () => {
  const [platforms] = useState<Platform[]>([
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      connected: true,
      accounts: [
        {
          id: '1',
          username: '@your_brand',
          profilePicture: '/placeholder.svg',
          isActive: true
        }
      ],
      capabilities: {
        canPublish: true,
        canSchedule: true,
        maxAccounts: 5
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      connected: true,
      accounts: [
        {
          id: '2',
          username: '@your_brand_ig',
          profilePicture: '/placeholder.svg',
          isActive: true
        }
      ],
      capabilities: {
        canPublish: false, // Draft only for demo
        canSchedule: true,
        maxAccounts: 1
      }
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: '📌',
      connected: false,
      accounts: [],
      capabilities: {
        canPublish: true,
        canSchedule: true,
        maxAccounts: 3
      }
    }
  ]);

  const getConnectedPlatforms = () => platforms.filter(p => p.connected);
  
  const getPlatformById = (id: string) => platforms.find(p => p.id === id);

  return {
    platforms,
    getConnectedPlatforms,
    getPlatformById
  };
};