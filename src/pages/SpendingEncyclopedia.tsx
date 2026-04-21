import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import LockedContent from "@/components/LockedContent";

interface PalaceSpendingEntry {
  palaceId: number;
  palaceName: string;
  nativeDoor: string;
  category: string;
  details: string;
  explanation: string;
}

// 按宫位原始门排列
const PALACE_SPENDING_ENTRIES: PalaceSpendingEntry[] = [
  { palaceId: 1, palaceName: '坎一宫', nativeDoor: '休门', category: '家庭、健康、休闲、修行', details: '家居用品、养生保健、度假休闲', explanation: '休门象征休息与家庭生活，花费可能用于家居用品、养生保健或度假休闲。' },
  { palaceId: 8, palaceName: '艮八宫', nativeDoor: '生门', category: '投资、生意、资产购置', details: '创业、理财、购置不动产或生产资料', explanation: '生门主财富与生机，支出多与创业、理财、购置不动产或生产资料相关。' },
  { palaceId: 3, palaceName: '震三宫', nativeDoor: '伤门', category: '医疗、法律、运动', details: '医疗费用、法律纠纷开支、运动器材购买', explanation: '伤门代表竞争与损伤，可能涉及医疗费用、法律纠纷开支或运动器材购买。' },
  { palaceId: 4, palaceName: '巽四宫', nativeDoor: '杜门', category: '技术产品、隐私保护、维修', details: '电子产品、保密服务（如加密软件）、维修费用', explanation: '杜门主隐秘与技术，可能用于购买电子产品、保密服务（如加密软件）或维修费用。' },
  { palaceId: 9, palaceName: '离九宫', nativeDoor: '景门', category: '旅行、娱乐、艺术装饰', details: '旅游、艺术收藏、演出门票、家居装饰', explanation: '景门象征文化与美景，花费倾向于旅游、艺术收藏、演出门票或家居装饰。' },
  { palaceId: 2, palaceName: '坤二宫', nativeDoor: '死门', category: '房地产、保险、长期储蓄', details: '房产、保险、长期理财项目', explanation: '死门关联稳定与终结，可能用于购置房产、购买保险或长期理财项目。' },
  { palaceId: 7, palaceName: '兑七宫', nativeDoor: '惊门', category: '饮食、娱乐、社交应酬、诉讼', details: '餐饮、聚会、法律诉讼相关费用', explanation: '惊门主口舌是非，开销多用于餐饮、聚会或应对法律诉讼。' },
  { palaceId: 6, palaceName: '乾六宫', nativeDoor: '开门', category: '事业拓展、职场发展、公开活动', details: '创业启动、职业培训、公开宣传', explanation: '开门象征新开始，支出可能用于创业启动、职业培训或公开宣传。' },
];

const SpendingEncyclopedia: React.FC = () => {
  const navigate = useNavigate();
  const { canAccess } = useMemberPermissions();
  const canViewFull = canAccess('destiny_full');

  const content = (
    <div className="space-y-3">
      {PALACE_SPENDING_ENTRIES.map((entry, idx) => (
        <Collapsible key={entry.palaceId} defaultOpen={idx === 0}>
          <div className="bg-card rounded-lg border border-border">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-bold">{entry.palaceName}</Badge>
                <ShoppingBag className="h-4 w-4 text-teal-500" />
                <span className="font-bold text-sm">{entry.nativeDoor}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600">
                  {entry.category.split('、')[0]}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-3 border border-teal-200/50 dark:border-teal-800/30">
                  <div className="flex items-start gap-2">
                    <ShoppingBag className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-teal-700 dark:text-teal-400">消费方向</span>
                      <p className="text-sm mt-1 font-medium">{entry.category}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">具体花费</span>
                  </div>
                  <p className="text-sm pl-5">{entry.details}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  {entry.explanation}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground mx-4">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-2 sm:px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-teal-500" />
              <h1 className="text-lg sm:text-xl font-bold">消费宝典</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl mb-24">
        <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-4 border border-teal-200/50 dark:border-teal-800/30 mb-6">
          <div className="flex items-start gap-2">
            <ShoppingBag className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-teal-700 dark:text-teal-400 mb-1">八门消费区域</p>
              <p className="text-xs text-muted-foreground">
                基于奇门遁甲八门理论，每个宫位有其原始门，代表不同的消费倾向与花费领域。看你的命宫落在哪个宫，即可判断你的消费方向。
              </p>
            </div>
          </div>
        </div>

        {canViewFull ? content : (
          <LockedContent isLocked={true} requiredTier="订阅会员">
            {content}
          </LockedContent>
        )}
      </div>
    </div>
  );
};

export default SpendingEncyclopedia;
