import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
  'W.P. Labuan', 'W.P. Putrajaya',
];

interface ShippingAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  initialData?: {
    firstName: string;
    lastName: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

export function ShippingAddressDialog({ open, onOpenChange, onSaved, initialData }: ShippingAddressDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Malaysia',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.address || !form.city || !form.state || !form.postcode) {
      toast({ title: '请填写必填地址信息', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        shipping_first_name: form.firstName,
        shipping_last_name: form.lastName,
        shipping_address: form.address,
        shipping_address2: form.address2,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_postcode: form.postcode,
        shipping_country: form.country,
      }).eq('id', user.id);

      if (error) throw error;
      toast({ title: '配送地址已保存' });
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: '保存失败', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>配送地址</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Select value={form.country} onValueChange={v => updateField('country', v)}>
            <SelectTrigger>
              <SelectValue placeholder="国家/地区" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Malaysia">Malaysia</SelectItem>
              {/* <SelectItem value="Singapore">Singapore</SelectItem> */}
              {/* <SelectItem value="Indonesia">Indonesia</SelectItem>
              <SelectItem value="Thailand">Thailand</SelectItem> */}
              {/* <SelectItem value="China">China</SelectItem> */}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="名 (选填)" value={form.firstName} onChange={e => updateField('firstName', e.target.value)} />
            <Input placeholder="姓" value={form.lastName} onChange={e => updateField('lastName', e.target.value)} />
          </div>

          <Input placeholder="地址" value={form.address} onChange={e => updateField('address', e.target.value)} />
          <Input placeholder="公寓、门牌号等 (选填)" value={form.address2} onChange={e => updateField('address2', e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="邮编" value={form.postcode} onChange={e => updateField('postcode', e.target.value)} />
            <Input placeholder="城市" value={form.city} onChange={e => updateField('city', e.target.value)} />
          </div>

          <Select value={form.state} onValueChange={v => updateField('state', v)}>
            <SelectTrigger>
              <SelectValue placeholder="州/省" />
            </SelectTrigger>
            <SelectContent>
              {MALAYSIAN_STATES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            保存地址
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
