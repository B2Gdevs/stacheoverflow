'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Shield, 
  UserPlus,
  MoreHorizontal,
  Mail,
  Calendar,
  Crown
} from 'lucide-react';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "test@test.com",
    role: "admin",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
    status: "active"
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    role: "member",
    createdAt: "2024-01-18",
    lastLogin: "2024-01-19",
    status: "active"
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "member",
    createdAt: "2024-01-19",
    lastLogin: "2024-01-20",
    status: "active"
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "member",
    createdAt: "2024-01-20",
    lastLogin: "Never",
    status: "inactive"
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const promoteToAdmin = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: 'admin' } : user
    ));
  };

  const demoteFromAdmin = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: 'member' } : user
    ));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-green-500 text-white">Admin</Badge>;
      case 'member':
        return <Badge variant="outline" className="border-gray-600 text-gray-300">Member</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-300">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="border-gray-600 text-gray-300">Inactive</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-300 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedRole === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRole('all')}
            className={selectedRole === 'all' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            All
          </Button>
          <Button
            variant={selectedRole === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRole('admin')}
            className={selectedRole === 'admin' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            Admins
          </Button>
          <Button
            variant={selectedRole === 'member' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRole('member')}
            className={selectedRole === 'member' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            Members
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-amber-600/20 rounded-full flex items-center justify-center">
                    {user.role === 'admin' ? (
                      <Crown className="h-5 w-5 text-green-500" />
                    ) : (
                      <Users className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {user.createdAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Last login: {user.lastLogin}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === 'admin' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => demoteFromAdmin(user.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Demote
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => promoteToAdmin(user.id)}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Promote
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
