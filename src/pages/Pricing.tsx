import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, Crown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMembershipOrders } from "@/hooks/useMembershipOrders";

const subscriberFeatures = [
  "无限次数字能量分析和生成号码",
  "完整命理盘（八字，奇门，六爻）解读",
  "添加创富分析，语商",
  "AI 智能解读",
  "专属客服通道",
  "优先新功能体验",
  "无限次下载命理报告",
];

const Pricing = () => {
  const navigate = useNavigate();
  const currentCurrency = 'RM';
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { createOrder } = useMembershipOrders();
  const [loading, setLoading] = useState(false);

  const isYiShang = profile?.source === '易商平台';
  const originalPrice = 3999;
  const price = isYiShang ? 1000 : 3999;

  const handleClose = () => {
    navigate('/dashboard');
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({ title: '请先登录', variant: 'destructive' });
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      await createOrder.mutateAsync({
        tier: 'subscriber',
        duration_months: 0, // 0 = permanent
        amount: price,
        currency: 'MYR',
      });

      toast({ title: '订单已提交', description: '请等待管理员审核激活您的会员' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: '提交失败', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/20 via-background to-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleClose}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <div />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center px-6 pt-4 pb-6">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
            <Crown className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-1">
          成为订阅会员
        </h1>
        <p className="text-muted-foreground text-center text-sm">
          一次付费，永久解锁全部功能
        </p>
      </div>

      {/* Price Display */}
      <div className="px-4 mb-4">
        <div className="p-5 rounded-xl border-2 border-foreground/50 bg-muted text-center relative overflow-hidden">
          {isYiShang && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              易商专属优惠
            </div>
          )}
          <div className="text-sm text-muted-foreground mb-2">永久订阅</div>
          <div className="flex items-baseline justify-center gap-2">
            {isYiShang && (
              <span className="text-lg text-muted-foreground line-through">{currentCurrency} {originalPrice.toLocaleString()}</span>
            )}
            <span className="text-3xl font-bold text-primary">{currentCurrency} {price.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">一次性付费，终身使用</div>
        </div>
      </div>

      {/* Features List */}
      <div className="flex-1 px-4 pb-4">
        <div className="bg-muted/50 rounded-xl p-4">
          <h3 className="font-medium mb-3 text-sm">订阅会员权益</h3>
          <ul className="space-y-2">
            {subscriberFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 flex-shrink-0 text-amber-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className="pt-6 text-xs text-slate-600">须符合条款与条规</span>
      </div>

      {/* CTA Section */}
      <div className="p-4 space-y-3 bg-gradient-to-t from-background via-background to-transparent mb-20">
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-12 text-base font-medium bg-amber-500 hover:bg-amber-600"
          size="lg"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            `提交订单 ${currentCurrency} ${price.toLocaleString()}`
          )}
        </Button>

        <button
          onClick={handleClose}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          暂时跳过
        </button>
      </div>
    </div>
  );
};

export default Pricing;
