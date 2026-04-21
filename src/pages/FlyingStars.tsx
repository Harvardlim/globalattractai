import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import LockedContent from "@/components/LockedContent";

// 九星数据
const NINE_STARS = [
  { num: 1, name: "一白贪狼星", element: "水", nature: "吉" },
  { num: 2, name: "二黑巨门星", element: "土", nature: "凶" },
  { num: 3, name: "三碧禄存星", element: "木", nature: "凶" },
  { num: 4, name: "四绿文昌星", element: "木", nature: "吉" },
  { num: 5, name: "五黄廉贞星", element: "土", nature: "凶" },
  { num: 6, name: "六白武曲星", element: "金", nature: "吉" },
  { num: 7, name: "七赤破军星", element: "金", nature: "凶" },
  { num: 8, name: "八白左辅星", element: "土", nature: "吉" },
  { num: 9, name: "九紫右弼星", element: "火", nature: "吉" },
];

// 2026丙午年 九宫飞星布局（中宫一白）
// 九宫格位置：SE, S, SW, E, Center, W, NE, N, NW
const PALACE_DATA_2026 = [
  {
    direction: "东南方",
    starNum: 9,
    title: "喜神位",
    titleColor: "bg-purple-500 text-white",
    description: "九紫右弼星主喜庆、姻缘、感情、添丁",
    mascots: "紫水晶、粉水晶、离火葫芦，催姻缘喜庆之事",
  },
  {
    direction: "正南方",
    starNum: 5,
    title: "五黄位",
    titleColor: "bg-yellow-400 text-black",
    description: "五黄廉贞星主凶灾、疾病、祸害，此位需定忌动",
    mascots: "五黄泄煞令、白水晶、黄铜葫芦、六帝钱",
  },
  {
    direction: "西南方",
    starNum: 7,
    title: "破财位",
    titleColor: "bg-yellow-300 text-black",
    description: "七赤破军星主破财、口舌、盗贼、耗损",
    mascots: "黑曜石、天青石、麒麟、安忍水，忌红色电器、绿植、刀剑",
  },
  {
    direction: "正东方",
    starNum: 8,
    title: "正财位",
    titleColor: "bg-green-500 text-white",
    description: "八白左辅星主正财、置业、事业",
    mascots: "黄水晶、聚宝盆、五路财神葫芦、四象四灵聚财阵",
  },
  {
    direction: "中宫",
    starNum: 1,
    title: "桃花位",
    titleColor: "bg-pink-400 text-white",
    description: "一白贪狼星主人缘人脉、感情、贵人",
    mascots: "白水晶、黄水晶、天青石",
  },
  {
    direction: "正西方",
    starNum: 3,
    title: "是非位",
    titleColor: "bg-yellow-300 text-black",
    description: "三碧禄存星主是非、官灾、冲突",
    mascots: "白水晶、粉水晶、紫薇诀挂件，忌鱼缸、水池",
  },
  {
    direction: "东北方",
    starNum: 4,
    title: "文昌位",
    titleColor: "bg-green-400 text-white",
    description: "四绿文昌星主学业、官位、创意",
    mascots: "文昌塔、天青石、海蓝宝、富贵竹",
  },
  {
    direction: "正北方",
    starNum: 6,
    title: "偏财位",
    titleColor: "bg-orange-400 text-white",
    description: "六白武曲星主偏财、贵人",
    mascots: "聚财阵、黄水晶、白水晶、黄铜貔貅",
  },
  {
    direction: "西北方",
    starNum: 2,
    title: "病符位",
    titleColor: "bg-red-400 text-white",
    description: "二黑巨门星主疾病、伤痛、灾厄",
    mascots: "二黑解厄令、白水晶、黄铜葫芦、六帝钱忌鱼缸、堆积杂物",
  },
];

// 星数字对应颜色
const getStarColor = (num: number): string => {
  switch (num) {
    case 1: return "text-blue-500";
    case 2: return "text-stone-700";
    case 3: return "text-emerald-600";
    case 4: return "text-green-500";
    case 5: return "text-amber-600";
    case 6: return "text-gray-700";
    case 7: return "text-red-500";
    case 8: return "text-gray-800";
    case 9: return "text-purple-500";
    default: return "text-foreground";
  }
};

const getStarBg = (num: number): string => {
  switch (num) {
    case 1: return "bg-blue-500/10";
    case 2: return "bg-stone-500/10";
    case 3: return "bg-emerald-500/10";
    case 4: return "bg-green-500/10";
    case 5: return "bg-amber-500/10";
    case 6: return "bg-gray-500/10";
    case 7: return "bg-red-500/10";
    case 8: return "bg-emerald-800/10";
    case 9: return "bg-purple-500/10";
    default: return "bg-muted";
  }
};

const getNatureStyle = (num: number) => {
  const star = NINE_STARS.find(s => s.num === num);
  return star?.nature === "吉" 
    ? "text-green-600 bg-green-500/10" 
    : "text-red-600 bg-red-500/10";
};

interface PalaceCardProps {
  palace: typeof PALACE_DATA_2026[0];
}

const PalaceCard: React.FC<PalaceCardProps> = ({ palace }) => {
  const star = NINE_STARS.find(s => s.num === palace.starNum)!;
  
  return (
    <div className={cn(
      "border border-border rounded-xl p-3 flex flex-col gap-2",
      getStarBg(palace.starNum)
    )}>
      {/* 方位 */}
      <div className="text-xs text-muted-foreground text-center font-medium">
        {palace.direction}
      </div>
      
      {/* 标签 */}
      <div className="flex justify-center">
        <span className={cn(
          "text-xs font-bold px-3 py-1 rounded-md",
          palace.titleColor
        )}>
          {palace.title}
        </span>
      </div>

      {/* 星名 */}
      <div className="text-center">
        <span className={cn("text-sm font-semibold", getStarColor(palace.starNum))}>
          {star.name}
        </span>
        <span className={cn(
          "ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium",
          getNatureStyle(palace.starNum)
        )}>
          {star.nature}
        </span>
      </div>

      {/* 描述 */}
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        {palace.description}
      </p>
      
      {/* 吉祥物建议 */}
      <div className="mt-auto pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">吉祥物建议：</span>
          {palace.mascots}
        </p>
      </div>
    </div>
  );
};

const FlyingStars: React.FC = () => {
  const navigate = useNavigate();
  const { canAccess } = useMemberPermissions();
  const canUse = canAccess('flying_stars');

  if (!canUse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3 max-w-2xl flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold">九宫飞星</h1>
          </div>
        </div>
        <LockedContent isLocked={true} requiredTier="订阅会员">
          <div className="h-64" />
        </LockedContent>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-2xl flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">2026 丙午年 九宫飞星图</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 中宫说明 */}
        <div className="bg-primary/5 rounded-xl p-4 mb-6 text-center border border-primary/10">
          <p className="text-sm font-medium">2026年（丙午年）中宫飞入 <span className="text-blue-500 font-bold">一白贪狼星</span></p>
          <p className="text-xs text-muted-foreground mt-1">下元九运 · 离火运</p>
        </div>

        {/* 3x3 九宫格 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {PALACE_DATA_2026.map((palace, idx) => (
            <PalaceCard key={idx} palace={palace} />
          ))}
        </div>

        {/* 注意事项 */}
        <div className="mt-6 bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">📌 年度风水提醒</h3>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>• <span className="text-red-500 font-medium">五黄煞（正南）</span>：太岁方位，切忌动土、装修，宜放铜器化煞</p>
            <p>• <span className="text-red-500 font-medium">二黑病符（西北）</span>：家中长辈需注意健康，忌堆放杂物</p>
            <p>• <span className="text-green-600 font-medium">八白正财（正东）</span>：今年最旺财位，宜摆放招财物品</p>
            <p>• <span className="text-green-600 font-medium">九紫喜神（东南）</span>：催旺姻缘桃花、喜庆之事</p>
            <p>• <span className="text-green-600 font-medium">四绿文昌（东北）</span>：学业考试最佳方位，宜放文昌塔</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyingStars;
