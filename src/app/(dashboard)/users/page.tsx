'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GlassCard, SkeletonTable } from '@/components/glass';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, MoreVertical, Shield, UserCog, X, Mail, Building, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import type { User, UserRole } from '@/types';

async function fetchUsers(): Promise<{ data: User[] }> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function fetchEvents(): Promise<{ data: { attendees: string[] }[] }> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

async function updateUserRole(userId: string, role: UserRole) {
  const response = await fetch(`/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error('Failed to update role');
  return response.json();
}

async function suspendUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}/suspend`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to suspend user');
  return response.json();
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => suspendUser(userId),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(
        updatedUser.suspended
          ? `${updatedUser.name} has been suspended`
          : `${updatedUser.name} has been unsuspended`
      );
      setSuspendTarget(null);
    },
    onError: () => {
      toast.error('Failed to update user status');
      setSuspendTarget(null);
    },
  });

  const users = data?.data || [];
  const events = eventsData?.data || [];
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getEventsCount = (userId: string) =>
    events.filter((e) => e.attendees.includes(userId)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Users Table */}
      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Status</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground sm:hidden">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => {
                          if (value) {
                            updateRoleMutation.mutate({ userId: user.id, role: value as UserRole });
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="coordinator">
                            <div className="flex items-center gap-2">
                              <UserCog className="h-3 w-3" />
                              Coordinator
                            </div>
                          </SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {user.department || '—'}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {user.suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Messaging coming soon')}>
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setSuspendTarget(user)}
                          >
                            {user.suspended ? 'Unsuspend User' : 'Suspend User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="glass-card relative z-10 w-full max-w-md p-6 rounded-xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-1 rounded-md hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg mb-4">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback className="text-xl">
                    {selectedUser.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {selectedUser.role}
                  </Badge>
                  {selectedUser.suspended && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{selectedUser.email}</span>
                </div>
                {selectedUser.department && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Building className="h-4 w-4 shrink-0" />
                    <span>{selectedUser.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{getEventsCount(selectedUser.id)} events joined</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendTarget?.suspended ? 'Unsuspend' : 'Suspend'} User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {suspendTarget?.suspended ? 'unsuspend' : 'suspend'}{' '}
              <strong>{suspendTarget?.name}</strong>?
              {!suspendTarget?.suspended &&
                ' They will lose access to the platform until unsuspended.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={suspendMutation.isPending}
              onClick={() => suspendTarget && suspendMutation.mutate(suspendTarget.id)}
            >
              {suspendMutation.isPending
                ? 'Processing...'
                : suspendTarget?.suspended
                  ? 'Unsuspend'
                  : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
