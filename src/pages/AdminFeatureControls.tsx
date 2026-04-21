import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FeatureControl {
  id: string;
  feature_key: string;
  feature_name: string;
  is_globally_disabled: boolean;
  disabled_platforms: string[];
  disabled_message: string;
  admin_bypass: boolean;
}

interface Platform {
  id: string;
  name: string;
}

const FEATURE_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: '书籍/宝典',
    keys: ['branch_relations', 'bazi_encyclopedia', 'energy_encyclopedia', 'qimen_encyclopedia', 'liuyao_encyclopedia', 'sihai_encyclopedia', 'wealth_encyclopedia', 'spending_encyclopedia', 'speech_encyclopedia', 'destiny_report'],
  },
  {
    label: '主要功能',
    keys: ['clients', 'energy', 'realtime', 'destiny', 'synastry', 'ai_chat', 'calendar', 'flying_stars', 'sihai_analysis'],
  },
  {
    label: '进阶工具',
    keys: ['hexagram', 'xiao_liu_ren', 'numerology'],
  },
  {
    label: '商城相关',
    keys: ['store', 'my_orders'],
  },
  {
    label: '系统设置',
    keys: ['translation'],
  },
];

const PRESET_MESSAGES = ['即将上线', '功能升级中', '维修中'];

const AdminFeatureControls: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [controls, setControls] = useState<FeatureControl[]>([]);
  const [localControls, setLocalControls] = useState<FeatureControl[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchData();
  }, [isSuperAdmin]);

  const fetchData = async () => {
    const [controlsRes, platformsRes] = await Promise.all([
      supabase.from('feature_controls').select('*').order('feature_name'),
      supabase.from('platforms').select('*').order('name'),
    ]);
    const data = (controlsRes.data as unknown as FeatureControl[]) || [];
    setControls(data);
    setLocalControls(JSON.parse(JSON.stringify(data)));
    if (platformsRes.data) setPlatforms(platformsRes.data);
    setLoading(false);
  };

  const hasChanges = useCallback(() => {
    return JSON.stringify(localControls) !== JSON.stringify(controls);
  }, [localControls, controls]);

  // Local-only mutations (no DB calls)
  const togglePlatform = (controlId: string, platformName: string) => {
    setLocalControls(prev => prev.map(c => {
      if (c.id !== controlId) return c;
      const current = c.disabled_platforms || [];
      const newPlatforms = current.includes(platformName)
        ? current.filter(p => p !== platformName)
        : [...current, platformName];
      return { ...c, disabled_platforms: newPlatforms };
    }));
  };

  const toggleAllPlatforms = (controlId: string) => {
    setLocalControls(prev => prev.map(c => {
      if (c.id !== controlId) return c;
      const newGloballyDisabled = !c.is_globally_disabled;
      return { ...c, is_globally_disabled: newGloballyDisabled, disabled_platforms: [] };
    }));
  };

  const toggleMessage = (controlId: string) => {
    setLocalControls(prev => prev.map(c => {
      if (c.id !== controlId) return c;
      const hasMessage = c.disabled_message && c.disabled_message.trim() !== '';
      return { ...c, disabled_message: hasMessage ? '' : '即将上线' };
    }));
  };

  const updateMessage = (controlId: string, message: string) => {
    setLocalControls(prev => prev.map(c => {
      if (c.id !== controlId) return c;
      return { ...c, disabled_message: message };
    }));
  };

  // Save all changes to DB
  const saveChanges = async () => {
    setSaving(true);
    const changed = localControls.filter(lc => {
      const orig = controls.find(c => c.id === lc.id);
      return JSON.stringify(lc) !== JSON.stringify(orig);
    });

    let hasError = false;
    for (const item of changed) {
      const { error, count } = await supabase
        .from('feature_controls')
        .update({
          is_globally_disabled: item.is_globally_disabled,
          disabled_platforms: item.disabled_platforms,
          disabled_message: item.disabled_message,
          admin_bypass: item.admin_bypass,
        } as any)
        .eq('id', item.id)
        .select();
      if (error) {
        hasError = true;
        toast.error(`更新「${item.feature_name}」失败: ${error.message}`);
      }
    }

    if (!hasError) {
      await fetchData();
      setShowSuccess(true);
      // Re-fetch from DB to confirm persistence
      await fetchData();
    }
    setSaving(false);
    setShowConfirm(false);
  };

  const getGroupedControls = () => {
    return FEATURE_GROUPS.map(group => ({
      ...group,
      items: group.keys
        .map(key => localControls.find(c => c.feature_key === key))
        .filter(Boolean) as FeatureControl[],
    }));
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Settings2 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">功能管理</h1>
            </div>
            {hasChanges() && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setShowConfirm(true)}
              >
                <Save className="h-4 w-4" />
                保存更改
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-2xl space-y-6">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">加载中...</div>
        ) : (
          getGroupedControls().map(group => (
            <div key={group.label}>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">{group.label}</h2>
              <div className="space-y-3">
                {group.items.map(control => {
                  const disabledCount = control.disabled_platforms?.length || 0;
                  const hasMessage = control.disabled_message && control.disabled_message.trim() !== '';
                  const allDisabled = control.is_globally_disabled;

                  return (
                    <Card key={control.id} className="border-border/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{control.feature_name}</h3>
                          {allDisabled && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              全部关闭
                            </Badge>
                          )}
                          {!allDisabled && disabledCount > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600">
                              部分关闭
                            </Badge>
                          )}
                          {!allDisabled && disabledCount === 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500 text-emerald-600">
                              全部开启
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-sm text-muted-foreground">全部平台关闭</span>
                          <Switch
                            checked={allDisabled}
                            onCheckedChange={() => toggleAllPlatforms(control.id)}
                          />
                        </div>

                        {!allDisabled && platforms.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">按平台关闭：</span>
                            <div className="flex flex-wrap gap-2">
                              {platforms.map(platform => {
                                const isOff = control.disabled_platforms?.includes(platform.name);
                                return (
                                  <label
                                    key={platform.id}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-pointer text-xs transition-colors ${
                                      isOff
                                        ? 'border-destructive/50 bg-destructive/10 text-destructive'
                                        : 'border-border hover:bg-muted/50'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={isOff}
                                      onCheckedChange={() => togglePlatform(control.id, platform.name)}
                                      className="h-3.5 w-3.5"
                                    />
                                    {platform.name}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 pt-1 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Admin 可访问</span>
                            <Switch
                              checked={control.admin_bypass}
                              onCheckedChange={() => {
                                setLocalControls(prev => prev.map(c =>
                                  c.id === control.id ? { ...c, admin_bypass: !c.admin_bypass } : c
                                ));
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pt-1 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">显示提示语</span>
                            <Switch
                              checked={hasMessage}
                              onCheckedChange={() => toggleMessage(control.id)}
                            />
                          </div>
                          {hasMessage && (
                            <div className="flex gap-1.5 flex-wrap">
                              {PRESET_MESSAGES.map(msg => (
                                <Button
                                  key={msg}
                                  size="sm"
                                  variant={control.disabled_message === msg ? 'default' : 'outline'}
                                  className="h-7 text-xs px-2.5"
                                  onClick={() => updateMessage(control.id, msg)}
                                >
                                  {msg}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>确认保存更改？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将更新功能控制设置，影响用户对相关功能的访问权限。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={saveChanges} disabled={saving}>
              {saving ? '保存中...' : '确认保存'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="rounded-lg max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle>更改成功</AlertDialogTitle>
            <AlertDialogDescription>
              功能控制设置已成功保存，更改即时生效。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>
              好的
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFeatureControls;
