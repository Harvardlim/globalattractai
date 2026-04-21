import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemberPermissions } from "@/hooks/useMemberPermissions";
import LockedContent from "@/components/LockedContent";

interface StarSpeechEntry {
  star: string;
  palaceName: string;
  style: string;
  traits: string[];
  tips: string[];
  mingGongNote?: string;
}

const STAR_SPEECH_ENTRIES: StarSpeechEntry[] = [
  {
    star: '天蓬', palaceName: '坎一宫',
    style: '学什么都是照耀，光而不耀，静水深流',
    traits: ['多讲出奇制胜的故事', '深藏不露的智慧表达', '以柔克刚的沟通方式'],
    tips: ['语言风格偏沉稳内敛', '善于用故事暗示深意', '适合一对一深度沟通'],
  },
  {
    star: '天任', palaceName: '艮八宫',
    style: '慢节奏，稳中求进，来日方长',
    traits: ['巅峰相见，语迟者贵', '直播周期要拉长', '多讲坚韧道来的故事'],
    tips: ['不急于表达，慢工出细活', '用真实经历打动人', '适合长期内容输出'],
  },
  {
    star: '天冲', palaceName: '震三宫',
    style: '平稳之中突然出金句，抑扬顿挫，有波动',
    traits: ['震宫情绪价值达到极致', '多研究电视剧，模仿跌宕起伏', '表情、语气、手势到位，用抑扬顿挫的语气带动情绪'],
    tips: ['善用情绪波动制造记忆点', '语言要有戏剧张力', '适合演讲和直播'],
    mingGongNote: '命宫：必须发挥情绪价值，语气跌宕起伏',
  },
  {
    star: '天辅', palaceName: '巽四宫',
    style: '柔和纯澈的，多用反问句，多提问',
    traits: ['抛出仿佛无助的问题，带动粉丝互动', '把你想讲的话，通过提问引起好奇', '再用故事的方式解答'],
    tips: ['善用提问引导思考', '温和但有深度', '适合教学和咨询类表达'],
    mingGongNote: '命宫：孔子、革新，大方向价值观不变，正反案例多种，正面反面都要讲，可以根据时事的故事展开',
  },
  {
    star: '天英', palaceName: '离九宫',
    style: '讲有高度有层次，高素质，修行的话',
    traits: ['语言有格局感', '善于提升话题高度', '用修行和哲理打动人'],
    tips: ['多用有深度的词汇', '引用经典和智慧语录', '适合知识型内容输出'],
  },
  {
    star: '天芮', palaceName: '坤二宫',
    style: '如大地，谦逊有礼，厚重包容',
    traits: ['朴实无华，承载托起', '向死而生的表达力量', '与德行相关的，国内外词语'],
    tips: ['用真诚打动人', '不需要华丽辞藻', '适合传递价值观和信念'],
  },
  {
    star: '天柱', palaceName: '兑七宫',
    style: '聊吃的，社会话题，结合所在的门选题',
    traits: ['关注热点，网络流行语', '兑宫讲话要有网感', '跟紧时事热点'],
    tips: ['善用流行文化和热梗', '语言接地气有亲和力', '适合社交媒体和短视频'],
  },
  {
    star: '天心', palaceName: '乾六宫',
    style: '自强不息，领导力，批发，裂变，大规模生意',
    traits: ['高维智慧，发挥自己', '看名人领袖传记', '星星之火，可以燎原'],
    tips: ['给我一个杠杆，我能翘起整个地球', '治大国如烹小鲜', '适合商业演讲和领导力表达'],
  },
  {
    star: '天禽', palaceName: '中五宫',
    style: '中正平和，稳重大气',
    traits: ['居中调和的沟通风格', '善于协调各方观点', '语言平衡有力'],
    tips: ['做桥梁和纽带型表达', '善于总结和归纳', '适合主持和协调类工作'],
  },
];

const SpeechEncyclopedia: React.FC = () => {
  const navigate = useNavigate();
  const { canAccess } = useMemberPermissions();
  const canViewFull = canAccess('destiny_full');

  const content = (
    <div className="space-y-3">
      {STAR_SPEECH_ENTRIES.map((entry, idx) => (
        <Collapsible key={entry.star} defaultOpen={idx === 0}>
          <div className="bg-card rounded-lg border border-border">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-bold">{entry.palaceName}</Badge>
                <MessageCircle className="h-4 w-4 text-indigo-500" />
                <span className="font-bold text-sm">{entry.star}</span>
                {/* <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 truncate max-w-[120px]">
                  {entry.style.slice(0, 10)}…
                </span> */}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-3">
                {/* 表达风格 */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 border border-indigo-200/50 dark:border-indigo-800/30">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">表达风格</span>
                      <p className="text-sm mt-1 font-medium">{entry.style}</p>
                    </div>
                  </div>
                </div>

                {/* 命宫特别提示 */}
                {entry.mingGongNote && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2.5 border border-amber-200/50 dark:border-amber-800/30">
                    <p className="text-xs text-amber-700 dark:text-amber-400">💡 {entry.mingGongNote}</p>
                  </div>
                )}

                {/* 表达特征 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">表达特征</span>
                  </div>
                  <div className="space-y-1 pl-1">
                    {entry.traits.map((trait, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-indigo-500 flex-shrink-0">•</span>
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 实操建议 */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">实操建议</span>
                  {entry.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-indigo-400 flex-shrink-0">→</span>
                      <span>{tip}</span>
                    </div>
                  ))}
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
              <MessageCircle className="h-5 w-5 text-indigo-500" />
              <h1 className="text-lg sm:text-xl font-bold">语商宝典</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl mb-24">
        <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4 border border-indigo-200/50 dark:border-indigo-800/30 mb-6">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">语商表达</p>
              <p className="text-xs text-muted-foreground">
                基于奇门遁甲九星理论，每个宫代表不同的表达风格与沟通方式。看你的命宫落在哪个宫，即可判断你的语商方向。
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

export default SpeechEncyclopedia;
