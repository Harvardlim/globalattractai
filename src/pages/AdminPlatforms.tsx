import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Platform {
  id: string;
  name: string;
  created_at: string;
}

interface AdminAccess {
  id: string;
  user_id: string;
  platform_name: string;
}

interface AdminProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  platforms: string[];
}

export default function AdminPlatforms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [newPlatform, setNewPlatform] = useState('');
  const [adding, setAdding] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Assign access state
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Fetch platforms
  const { data: platforms = [], isLoading: loadingPlatforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('platforms' as any).select('*').order('created_at') as any);
      if (error) throw error;
      return (data || []) as Platform[];
    },
    enabled: isSuperAdmin,
  });

  // Fetch admin users with their platform access
  const { data: admins = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['admin-users-with-access'],
    queryFn: async () => {
      // Get all admin/superadmin roles
      const { data: roles, error: rolesErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesErr) throw rolesErr;

      const adminRoles = (roles || []).filter((r: any) => r.role === 'admin' || r.role === 'superadmin');
      if (adminRoles.length === 0) return [];

      const userIds = adminRoles.map((r: any) => r.user_id);
      const roleMap = new Map(adminRoles.map((r: any) => [r.user_id, r.role]));

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds);

      // Fetch platform access
      const { data: access } = await (supabase.from('admin_platform_access' as any).select('*') as any);

      const accessMap = new Map<string, string[]>();
      (access || []).forEach((a: AdminAccess) => {
        const existing = accessMap.get(a.user_id) || [];
        existing.push(a.platform_name);
        accessMap.set(a.user_id, existing);
      });

      return (profiles || []).map((p: any) => ({
        ...p,
        role: roleMap.get(p.id) || 'admin',
        platforms: accessMap.get(p.id) || [],
      })) as AdminProfile[];
    },
    enabled: isSuperAdmin,
  });

  const handleAddPlatform = async () => {
    const name = newPlatform.trim();
    if (!name) return;
    setAdding(true);
    try {
      const { error } = await (supabase.from('platforms' as any).insert({ name }) as any);
      if (error) throw error;
      toast({ title: '平台已添加' });
      setNewPlatform('');
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    } catch (err: any) {
      toast({ title: '添加失败', description: err.message?.includes('duplicate') ? '平台名已存在' : err.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePlatform = async () => {
    if (!platformToDelete) return;
    setDeleting(true);
    try {
      const { error } = await (supabase.from('platforms' as any).delete().eq('name', platformToDelete.name) as any);
      if (error) throw error;
      // Also remove all access entries for this platform
      await (supabase.from('admin_platform_access' as any).delete().eq('platform_name', platformToDelete.name) as any);
      toast({ title: '平台已删除' });
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-access'] });
    } catch (err: any) {
      toast({ title: '删除失败', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
      setPlatformToDelete(null);
    }
  };

  const handleAssignAccess = async () => {
    if (!selectedAdmin || !selectedPlatform) return;
    setAssigning(true);
    try {
      const { error } = await (supabase.from('admin_platform_access' as any).insert({
        user_id: selectedAdmin,
        platform_name: selectedPlatform,
      }) as any);
      if (error) throw error;
      toast({ title: '权限已分配' });
      setSelectedAdmin('');
      setSelectedPlatform('');
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-access'] });
    } catch (err: any) {
      toast({ title: '分配失败', description: err.message?.includes('duplicate') ? '该管理员已有此平台权限' : err.message, variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAccess = async (userId: string, platformName: string) => {
    try {
      const { error } = await (supabase.from('admin_platform_access' as any).delete().eq('user_id', userId).eq('platform_name', platformName) as any);
      if (error) throw error;
      toast({ title: '权限已移除' });
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-access'] });
    } catch (err: any) {
      toast({ title: '移除失败', description: err.message, variant: 'destructive' });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">仅超级管理员可访问</p>
      </div>
    );
  }

  const regularAdmins = admins.filter(a => a.role === 'admin');

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">平台 & 来源管理</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Platforms Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">平台列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingPlatforms ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {platforms.map(p => (
                  <div key={p.id} className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5">
                    <span className="text-sm">{p.name}</span>
                    <button
                      onClick={() => setPlatformToDelete(p)}
                      className="text-muted-foreground hover:text-destructive ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="新平台名称..."
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlatform()}
                className="flex-1"
              />
              <Button size="sm" disabled={adding || !newPlatform.trim()} onClick={handleAddPlatform}>
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">管理员平台权限</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assign access */}
            <div className="flex gap-2">
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择管理员" />
                </SelectTrigger>
                <SelectContent>
                  {regularAdmins.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.display_name || a.email || a.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择平台" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(p => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" disabled={assigning || !selectedAdmin || !selectedPlatform} onClick={handleAssignAccess}>
                分配
              </Button>
            </div>

            {/* Admin list with their access */}
            {loadingAdmins ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map(admin => (
                  <div key={admin.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{admin.display_name || admin.email}</span>
                      <Badge variant={admin.role === 'superadmin' ? 'default' : 'secondary'} className={`text-[10px] ${admin.role === 'superadmin' ? 'bg-red-600' : ''}`}>
                        {admin.role === 'superadmin' ? 'SuperAdmin' : 'Admin'}
                      </Badge>
                    </div>
                    {admin.role === 'superadmin' ? (
                      <p className="text-xs text-muted-foreground">可查看全部平台</p>
                    ) : admin.platforms.length === 0 ? (
                      <p className="text-xs text-muted-foreground">未分配平台（无法查看任何会员）</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {admin.platforms.map(pName => (
                          <Badge key={pName} variant="outline" className="text-xs gap-1">
                            {pName}
                            <button onClick={() => handleRemoveAccess(admin.id, pName)} className="hover:text-destructive">
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Platform Confirm */}
      <AlertDialog open={!!platformToDelete} onOpenChange={(open) => !open && setPlatformToDelete(null)}>
        <AlertDialogContent className="w-[calc(100%-3rem)] max-w-lg rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除平台</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除平台「{platformToDelete?.name}」吗？该平台的管理员权限也将被清除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 mt-0" disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlatform} disabled={deleting} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
