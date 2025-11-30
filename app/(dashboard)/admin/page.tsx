'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Music, 
  CreditCard, 
  Shield,
  Settings,
  Gift,
  Upload,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconSize } from '@/lib/utils/icon-sizes';
import { useFeatureFlag } from '@/lib/swr/hooks';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color?: string;
}

function QuickActionCard({ title, description, icon: Icon, href, color = 'green' }: QuickActionCardProps) {
  const colorClasses = {
    green: 'text-green-400 bg-green-400/10 border-green-400/20 hover:bg-green-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20 hover:bg-orange-400/20',
    pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20 hover:bg-pink-400/20',
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.green;

  return (
    <Link href={href}>
      <Card className={cn(
        "bg-gray-900 border-gray-700 transition-all cursor-pointer",
        "hover:border-gray-600 hover:shadow-lg",
        colorClass
      )}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-lg",
              colorClass
            )}>
              <Icon className={cn(getIconSize('lg'), "text-current")} />
            </div>
            <CardTitle className="text-white text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const { enabled: subscriptionsEnabled } = useFeatureFlag('SUBSCRIPTIONS_ENABLED');

  const quickActions = [
    {
      title: 'Users',
      description: 'Manage users, roles, and view purchase history',
      icon: Users,
      href: '/admin/users',
      color: 'blue' as const,
    },
    {
      title: 'Beats',
      description: 'Upload new beats and manage your catalog',
      icon: Music,
      href: '/admin/upload',
      color: 'green' as const,
    },
    {
      title: 'Beat Packs',
      description: 'Create and manage beat packs',
      icon: Package,
      href: '/admin/edit-pack',
      color: 'purple' as const,
    },
    {
      title: 'Feature Flags',
      description: 'Enable or disable features without code changes',
      icon: Settings,
      href: '/admin/feature-flags',
      color: 'orange' as const,
    },
    {
      title: 'Promo Codes',
      description: 'Create and manage promotional codes for free assets',
      icon: Gift,
      href: '/admin/promos',
      color: 'pink' as const,
    },
    ...(subscriptionsEnabled ? [{
      title: 'Subscriptions',
      description: 'Manage subscription plans and monitor active subscriptions',
      icon: CreditCard,
      href: '/admin/subscriptions',
      color: 'green' as const,
    }] : []),
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your marketplace and tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className={cn(getIconSize('md'), "text-green-400")} />
          <span className="text-green-400 font-medium">Admin Access</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.href}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              color={action.color}
            />
          ))}
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className={cn(getIconSize('md'), "text-green-400")} />
            Admin Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            Use the quick action cards above to access all admin tools. Each tool helps you manage different aspects of your marketplace.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white font-medium mb-2">Content Management</p>
              <ul className="text-gray-400 space-y-1">
                <li>• Upload and manage beats</li>
                <li>• Create beat packs</li>
                <li>• Edit existing content</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-2">Configuration</p>
              <ul className="text-gray-400 space-y-1">
                <li>• Toggle feature flags</li>
                <li>• Create promo codes</li>
                <li>• Manage subscriptions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
