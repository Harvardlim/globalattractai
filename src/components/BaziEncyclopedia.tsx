import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, ChevronDown, Crown, Star, AlertTriangle, Sparkles, 
  CheckCircle2, XCircle, Lightbulb, Shield, User, MessageCircle, Briefcase, Activity, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DAY_MASTER_PERSONALITIES, ELEMENT_COLOR_MAP, DayMasterPersonality } from '@/data/dayMasterPersonalityData';
import { TEN_GOD_CHARACTERISTICS, TEN_GOD_CAREERS } from '@/data/baziTenGodsData';
import { 
  NORMAL_PATTERNS, 
  SPECIAL_DOMINANT_PATTERNS, 
  SPECIAL_FOLLOWING_PATTERNS, 
  SPECIAL_TRANSFORMATION_PATTERNS,
  SPECIAL_LU_REN_PATTERNS,
  AUSPICIOUS_COMBINATIONS, 
  INAUSPICIOUS_COMBINATIONS,
  ESTABLISHED_PATTERN_TRAITS,
  BROKEN_PATTERN_TRAITS,
  NO_PATTERN_CHARACTERISTICS,
  BROKEN_PATTERN_SOLUTIONS,
} from '@/data/baziPatternData';

// 神煞数据（静态参考）- 基于《御定奇门宝鉴》
interface ShenShaRefInfo {
  name: string;
  type: 'auspicious' | 'inauspicious';
  description: string;
  effect: string;
  calculation: string;
}

const SHEN_SHA_REFERENCE: ShenShaRefInfo[] = [
  // ===== 吉神 =====
  { name: '天乙贵人', type: 'auspicious', description: '【顶级吉神】', effect: '最强守护神，解生死灾厄、提升社会地位，遇事有人帮扶，化险为夷，从政经商者命局多见', calculation: '甲戊兼牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，庚辛逢马虎' },
  { name: '天德贵人', type: 'auspicious', description: '【顶级吉神】', effect: '化解意外灾劫（车祸/事故），增强阴德福报，一生少灾厄，遇难有救，可化解血光之灾', calculation: '正丁二申宫，三壬四辛同，五亥六甲上，七癸八艮逢，九丙十居乙，子巽丑庚中' },
  { name: '月德贵人', type: 'auspicious', description: '【顶级吉神】', effect: '月中德神，消减病痛官非，增强贵人缘，一生平安，逢凶化吉，官非口舌易化解', calculation: '寅午戌月丙，申子辰月壬，亥卯未月甲，巳酉丑月庚' },
  { name: '太极贵人', type: 'auspicious', description: '主聪明好学，有钻研之心', effect: '利于学术研究，易得名声', calculation: '甲乙生人子午中，丙丁卯酉报君知，戊己辰戌位，庚辛巳亥不须疑，壬癸丑未' },
  { name: '文昌贵人', type: 'auspicious', description: '【顶级吉神】', effect: '主文章、学业、考试，利于考试、升学、学术研究', calculation: '甲乙巳午，丙戊申宫，丁己酉位，庚亥辛子，壬寅癸卯' },
  { name: '学堂', type: 'auspicious', description: '主读书聪明，利于求学', effect: '学业有成，易获功名', calculation: '寅午戌日见亥，申子辰日见申，巳酉丑日见巳，亥卯未日见寅' },
  { name: '禄神', type: 'auspicious', description: '主俸禄、薪资、稳定收入', effect: '一生衣禄无忧，工作稳定', calculation: '甲禄在寅，乙禄在卯，丙戊禄在巳，丁己禄在午，庚禄在申，辛禄在酉，壬禄在亥，癸禄在子' },
  { name: '将星', type: 'auspicious', description: '主权力、领导、管理能力', effect: '有领导才能，适合从政或管理岗位', calculation: '寅午戌见午，申子辰见子，巳酉丑见酉，亥卯未见卯' },
  { name: '驿马', type: 'auspicious', description: '主迁动、变化、出行', effect: '多走动，利于外出发展', calculation: '寅午戌见申，申子辰见寅，巳酉丑见亥，亥卯未见巳' },
  { name: '华盖', type: 'auspicious', description: '主艺术天赋、宗教缘分', effect: '有艺术细胞，聪明好学，但略显孤傲', calculation: '寅午戌见戌，申子辰见辰，巳酉丑见丑，亥卯未见未' },
  { name: '金舆', type: 'auspicious', description: '主配偶富贵、财运', effect: '配偶家境好，婚姻带来财富', calculation: '甲辰乙巳丙未丁申戊未己申庚戌辛亥壬丑癸寅' },
  { name: '金匮', type: 'auspicious', description: '主财库、储蓄能力', effect: '善于理财，财运稳定', calculation: '日支见财库' },
  { name: '天厨', type: 'auspicious', description: '主食禄、口福', effect: '一生口福不断，衣食无忧', calculation: '甲丁食巳，乙丙食午，戊辛食申，己庚食酉，壬食亥，癸食子' },
  { name: '福星', type: 'auspicious', description: '主福气、吉祥', effect: '一生有福，多得贵人帮助', calculation: '根据日干查特定地支' },
  // ===== 凶神 =====
  { name: '羊刃', type: 'inauspicious', description: '主刚强、争斗、血光', effect: '性格刚烈，须防意外伤害，需官杀制化', calculation: '甲刃在卯，乙刃在寅，丙戊刃在午，丁己刃在巳，庚刃在酉，辛刃在申，壬刃在子，癸刃在亥' },
  { name: '劫煞', type: 'inauspicious', description: '主劫夺、小人、破财', effect: '须防小人暗算，钱财易被劫', calculation: '寅午戌见亥，申子辰见巳，巳酉丑见寅，亥卯未见申' },
  { name: '灾煞', type: 'inauspicious', description: '主灾祸、疾病、意外', effect: '须注意健康和安全，防意外之灾', calculation: '寅午戌见子，申子辰见午，巳酉丑见卯，亥卯未见酉' },
  { name: '亡神', type: 'inauspicious', description: '主损失、是非、官司', effect: '须防口舌是非，做事谨慎（若有正印约束可转吉为智）', calculation: '寅午戌见巳，申子辰见亥，巳酉丑见申，亥卯未见寅' },
  { name: '天罗地网', type: 'inauspicious', description: '主困顿、阻滞', effect: '传统主做事多阻碍；现代从事网络、数据行业反有成就（现代解读：互联网/大数据行业反主吉）', calculation: '戌亥为天罗，辰巳为地网' },
  { name: '孤辰', type: 'inauspicious', description: '主孤独、婚姻不顺', effect: '感情婚姻易有波折，晚婚为宜', calculation: '寅卯辰见巳，巳午未见申，申酉戌见亥，亥子丑见寅' },
  { name: '寡宿', type: 'inauspicious', description: '主孤寡、婚姻不顺', effect: '感情婚姻易有波折，晚婚为宜', calculation: '寅卯辰见丑，巳午未见辰，申酉戌见未，亥子丑见戌' },
  { name: '桃花', type: 'inauspicious', description: '主情缘、异性缘', effect: '异性缘强（墙外桃花主风流），须防感情纠葛', calculation: '寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子' },
  { name: '阴差阳错', type: 'inauspicious', description: '主婚姻不顺、感情波折', effect: '婚姻感情多有反复，须慎重择偶', calculation: '丙子丁丑戊寅辛卯壬辰癸巳丙午丁未戊申辛酉壬戌癸亥' },
  { name: '元辰', type: 'inauspicious', description: '主背运、小人', effect: '运势低迷时易遇小人', calculation: '甲阳见丑，乙阴见子，依此类推' },
];

interface BaziEncyclopediaProps {
  trigger?: React.ReactNode;
}

const BaziEncyclopedia: React.FC<BaziEncyclopediaProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-1" />
            八字宝典
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0">
        <SheetHeader className="p-4">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            八字宝典
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="daymaster" className="flex-1 flex flex-col h-[calc(100vh-80px)]">
          <TabsList className="mx-4 mt-2 grid grid-cols-4 w-auto">
            <TabsTrigger value="daymaster" className="text-xs">日主</TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs">格局</TabsTrigger>
            <TabsTrigger value="shensha" className="text-xs">神煞</TabsTrigger>
            <TabsTrigger value="combinations" className="text-xs">吉凶格</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 px-4 pb-4">
            <TabsContent value="daymaster" className="mt-4 space-y-4">
              <DayMasterSection />
            </TabsContent>
            
            <TabsContent value="patterns" className="mt-4 space-y-4">
              <PatternsSection />
            </TabsContent>
            
            <TabsContent value="shensha" className="mt-4 space-y-4">
              <ShenShaSection />
            </TabsContent>
            
            <TabsContent value="combinations" className="mt-4 space-y-4">
              <CombinationsSection />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// ===== 日主性格部分 =====
const DayMasterSection: React.FC = () => {
  // 按五行分组
  const groupedByElement = {
    '木': ['甲', '乙'],
    '火': ['丙', '丁'],
    '土': ['戊', '己'],
    '金': ['庚', '辛'],
    '水': ['壬', '癸'],
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-2">
        日主即日柱天干，代表命主本人。了解日主性格有助于认识自我及与他人沟通。
      </p>
      
      {Object.entries(groupedByElement).map(([element, stems]) => {
        const colors = ELEMENT_COLOR_MAP[element];
        return (
          <div key={element} className="space-y-2">
            <h4 className={cn('text-sm font-medium px-2 flex items-center gap-1', colors.text)}>
              {element === '木' && '甲乙木日主性情'}
              {element === '火' && '丙丁火日主性情'}
              {element === '土' && '戊己土日主性情'}
              {element === '金' && '庚辛金日主性情'}
              {element === '水' && '壬癸水日主性情'}
            </h4>
            {/* 五行总体特征 */}
            <div className={cn('rounded-lg p-2 mx-2 text-xs', colors.bg, 'border', colors.border)}>
              {DAY_MASTER_PERSONALITIES[stems[0]]?.elementTraits}
            </div>
            {/* 各天干详细 */}
            {stems.map(stem => {
              const personality = DAY_MASTER_PERSONALITIES[stem];
              if (!personality) return null;
              return <DayMasterCard key={stem} personality={personality} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

// 日主性格卡片
const DayMasterCard: React.FC<{ personality: DayMasterPersonality }> = ({ personality }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = ELEMENT_COLOR_MAP[personality.element];

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('text-xs', colors.text, colors.border)}>
            {personality.stem}{personality.element}
          </Badge>
          <span className={cn('text-xs', colors.text)}>{personality.polarity}{personality.element}，{personality.nickname}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t bg-muted/30 pt-3">
          {/* 优势与提醒 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <h6 className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                优势
              </h6>
              <ul className="space-y-0.5">
                {personality.strengths.map((s, idx) => (
                  <li key={idx} className="text-[11px] text-green-700 dark:text-green-400">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <h6 className="text-xs font-medium text-orange-600 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                提醒
              </h6>
              <ul className="space-y-0.5">
                {personality.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-[11px] text-orange-700 dark:text-orange-400">• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 适合职业 */}
          <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h6 className="text-xs font-medium text-blue-600 mb-1.5 flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              职业参考
            </h6>
            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">适合</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {personality.career.suitable.slice(0, 6).map((job, idx) => (
                    <span key={idx} className="text-[10px] px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded">{job}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">不适合</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {personality.career.unsuitable.map((job, idx) => (
                    <span key={idx} className="text-[10px] px-1 py-0.5 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-300 rounded border border-red-200 dark:border-red-700">{job}</span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{personality.career.advice}</p>
            </div>
          </div>

          {/* 感情婚姻 */}
          <div className="rounded-lg p-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
            <h6 className="text-xs font-medium text-pink-600 mb-1.5 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              感情婚姻 · {personality.relationship.style}
            </h6>
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {personality.relationship.strengths.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="text-[10px] px-1 py-0.5 bg-pink-100 dark:bg-pink-800/50 text-pink-700 dark:text-pink-300 rounded">{s}</span>
                ))}
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">理想伴侣：</span>
                <span className="text-[10px] text-foreground">{personality.relationship.idealPartner}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{personality.relationship.advice}</p>
            </div>
          </div>

          {/* 健康提示 */}
          <div className="rounded-lg p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <h6 className="text-xs font-medium text-rose-600 mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              健康提示
            </h6>
            <div className="flex flex-wrap gap-1 mb-1">
              {personality.health.focus.map((item, idx) => (
                <span key={idx} className="text-[10px] px-1 py-0.5 bg-rose-100 dark:bg-rose-800/50 text-rose-700 dark:text-rose-300 rounded">{item}</span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">{personality.health.advice}</p>
          </div>

          {/* 如何沟通 */}
          <div className="rounded-lg p-3 bg-primary/5 border border-primary/20">
            <h6 className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              如何沟通 · {personality.communication.approach}
            </h6>
            
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">沟通技巧</span>
                <ul className="mt-0.5 space-y-0.5">
                  {personality.communication.tips.map((tip, idx) => (
                    <li key={idx} className="text-[11px] text-foreground">✓ {tip}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">沟通禁忌</span>
                <ul className="mt-0.5 space-y-0.5">
                  {personality.communication.avoid.map((avoid, idx) => (
                    <li key={idx} className="text-[11px] text-destructive">✗ {avoid}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ===== 格局部分 =====
const PatternsSection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    normal: false,
    special: false,
    traits: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      {/* 格局（普通格局） */}
      <Collapsible open={expandedSections.normal} onOpenChange={() => toggleSection('normal')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Crown className="h-4 w-4 text-primary" />
            格局（十大格局）
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.normal && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {Object.values(NORMAL_PATTERNS).map((pattern) => (
            <PatternCard key={pattern.name} pattern={pattern} />
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* 特殊格局 */}
      <Collapsible open={expandedSections.special} onOpenChange={() => toggleSection('special')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-amber-500" />
            特殊格局
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.special && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-4">
          {/* 禄刃格 */}
          <div className="space-y-2 w-8">
            <h4 className="text-xs font-medium text-muted-foreground px-2">禄刃格</h4>
            {SPECIAL_LU_REN_PATTERNS.map((pattern) => (
              <SpecialPatternCard key={pattern.name} pattern={pattern} />
            ))}
          </div>
          {/* 专旺格 */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground px-2">专旺格（一行得气格）</h4>
            {SPECIAL_DOMINANT_PATTERNS.map((pattern) => (
              <SpecialPatternCard key={pattern.name} pattern={pattern} />
            ))}
          </div>
          {/* 从格 */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground px-2">从格</h4>
            {SPECIAL_FOLLOWING_PATTERNS.map((pattern) => (
              <SpecialPatternCard key={pattern.name} pattern={pattern} />
            ))}
          </div>
          {/* 化气格 */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground px-2">化气格</h4>
            {SPECIAL_TRANSFORMATION_PATTERNS.map((pattern) => (
              <SpecialPatternCard key={pattern.name} pattern={pattern} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 成格/破格特征 */}
      <Collapsible open={expandedSections.traits} onOpenChange={() => toggleSection('traits')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            成格/破格特征
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', expandedSections.traits && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          {/* 成格特征 */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              {ESTABLISHED_PATTERN_TRAITS.title}
            </h5>
            <ul className="space-y-1">
              {ESTABLISHED_PATTERN_TRAITS.characteristics.map((trait, idx) => (
                <li key={idx} className="text-xs text-green-800 dark:text-green-200 flex items-start gap-1">
                  <span className="text-green-500 shrink-0">•</span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 破格特征 */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
            <h5 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              {BROKEN_PATTERN_TRAITS.title}
            </h5>
            <ul className="space-y-1">
              {BROKEN_PATTERN_TRAITS.characteristics.map((trait, idx) => (
                <li key={idx} className="text-xs text-orange-800 dark:text-orange-200 flex items-start gap-1">
                  <span className="text-orange-500 shrink-0">•</span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 无格局特征 */}
          <div className="bg-muted/50 rounded-lg p-3 border">
            <h5 className="text-sm font-medium mb-2">{NO_PATTERN_CHARACTERISTICS.title}</h5>
            <ul className="space-y-1">
              {NO_PATTERN_CHARACTERISTICS.traits.map((trait, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-primary shrink-0">•</span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 破格建议 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              破格/无格局解决建议
            </h5>
            <ul className="space-y-1">
              {BROKEN_PATTERN_SOLUTIONS.map((solution, idx) => (
                <li key={idx} className="text-xs text-blue-800 dark:text-blue-200 flex items-start gap-1">
                  <span className="text-blue-500 shrink-0">→</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// 普通格局卡片
const PatternCard: React.FC<{ pattern: typeof NORMAL_PATTERNS[keyof typeof NORMAL_PATTERNS] }> = ({ pattern }) => {
  const [expanded, setExpanded] = useState(false);
  
  const tenGodName = pattern.name.replace('格', '');
  const tenGodChar = TEN_GOD_CHARACTERISTICS[tenGodName];
  const tenGodCareer = TEN_GOD_CAREERS[tenGodName];

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{pattern.name}</Badge>
          <span className="text-xs text-muted-foreground">{pattern.coreCharacteristics}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t bg-muted/30">
          <div className="pt-2">
            <span className="text-xs font-medium text-muted-foreground">成格条件：</span>
            <p className="text-xs mt-0.5">{pattern.formationCondition}</p>
          </div>
          
          {tenGodChar && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h6 className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    优点
                  </h6>
                  <ul className="space-y-0.5">
                    {tenGodChar.strengths.map((s, idx) => (
                      <li key={idx} className="text-[11px] text-green-700 dark:text-green-400">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <h6 className="text-xs font-medium text-orange-600 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    缺点
                  </h6>
                  <ul className="space-y-0.5">
                    {tenGodChar.weaknesses.map((w, idx) => (
                      <li key={idx} className="text-[11px] text-orange-700 dark:text-orange-400">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg p-2 bg-primary/5 border border-primary/20">
                <h6 className="text-xs font-medium text-primary mb-1">处事方式</h6>
                <p className="text-[11px] text-foreground">{tenGodChar.handlingStyle}</p>
              </div>

              <div className="rounded-lg p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <h6 className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  冲突触发点
                </h6>
                <ul className="space-y-0.5">
                  {tenGodChar.conflictTriggers.map((t, idx) => (
                    <li key={idx} className="text-[11px] text-red-700 dark:text-red-400">⚡ {t}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg p-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                <h6 className="text-xs font-medium text-pink-600 mb-1 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  感情模式
                </h6>
                <p className="text-[11px] text-pink-700 dark:text-pink-300">{tenGodChar.emotionalStyle}</p>
              </div>

              <div className="rounded-lg p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <h6 className="text-xs font-medium text-rose-600 mb-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  健康提示
                </h6>
                <div className="flex flex-wrap gap-1">
                  {tenGodChar.health.map((h, idx) => (
                    <span key={idx} className="text-[10px] px-1 py-0.5 bg-rose-100 dark:bg-rose-800/50 text-rose-700 dark:text-rose-300 rounded">{h}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {tenGodCareer && (
            <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h6 className="text-xs font-medium text-blue-600 mb-1.5 flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                职业参考
              </h6>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium">适合</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {tenGodCareer.suitableRoles.map((role, idx) => (
                      <span key={idx} className="text-[10px] px-1 py-0.5 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded">{role}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium">不适合</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {tenGodCareer.unsuitableRoles.map((role, idx) => (
                      <span key={idx} className="text-[10px] px-1 py-0.5 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-300 rounded border border-red-200 dark:border-red-700">{role}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-medium text-muted-foreground">现代领域：</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {pattern.modernFields.map((field, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px]">{field}</Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">护卫需求：</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {pattern.protectionNeeds.map((need, idx) => (
                <span key={idx} className="text-xs text-green-600 dark:text-green-400">{need}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-red-500">怕遇见：</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {pattern.fears.map((fear, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] border-red-300 text-red-600">{fear}</Badge>
              ))}
            </div>
          </div>

          {tenGodChar && (
            <div className="rounded-lg p-2 bg-primary/5 border border-primary/20">
              <h6 className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                命理建议
              </h6>
              <ul className="space-y-0.5">
                {tenGodChar.advice.map((a, idx) => (
                  <li key={idx} className="text-[11px] text-foreground">→ {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 特殊格局卡片
const SpecialPatternCard: React.FC<{ pattern: typeof SPECIAL_DOMINANT_PATTERNS[number] }> = ({ pattern }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-2 gap-2">
          <Badge variant="outline" className=" text-xs border-amber-500 text-amber-600">{pattern.name}</Badge>
          <span className="text-xs text-muted-foreground">{pattern.characteristics}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t bg-muted/30">
          <div className="pt-2">
            <span className="text-xs font-medium text-muted-foreground">成格条件：</span>
            <p className="text-xs mt-0.5">{pattern.formationCondition}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-red-500">忌讳：</span>
            <p className="text-xs mt-0.5 text-red-600">{pattern.prohibitions}</p>
          </div>
          {pattern.favorableGods && pattern.favorableGods.length > 0 && (
            <div>
              <span className="text-xs font-medium text-green-600">喜用：</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {pattern.favorableGods.map((god, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] border-green-300 text-green-600">{god}</Badge>
                ))}
              </div>
            </div>
          )}
          {pattern.unfavorableGods && pattern.unfavorableGods.length > 0 && (
            <div>
              <span className="text-xs font-medium text-red-500">忌神：</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {pattern.unfavorableGods.map((god, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] border-red-300 text-red-600">{god}</Badge>
                ))}
              </div>
            </div>
          )}
          {pattern.fortuneAdvice && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-medium text-blue-600">运势建议：</span>
              <p className="text-xs mt-0.5 text-blue-700 dark:text-blue-300">{pattern.fortuneAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ===== 神煞部分 =====
const ShenShaSection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    auspicious: false,
    inauspicious: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 按类型分类神煞
  const auspiciousShenSha = SHEN_SHA_REFERENCE.filter(s => s.type === 'auspicious');
  const inauspiciousShenSha = SHEN_SHA_REFERENCE.filter(s => s.type === 'inauspicious');

  return (
    <div className="space-y-3">
      {/* 吉神 */}
      <Collapsible open={expandedSections.auspicious} onOpenChange={() => toggleSection('auspicious')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <Star className="h-4 w-4" />
            吉神 ({auspiciousShenSha.length})
          </span>
          <ChevronDown className={cn('h-4 w-4 text-green-600 transition-transform', expandedSections.auspicious && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {auspiciousShenSha.map((data) => (
            <ShenShaCard key={data.name} data={data} />
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* 凶神 */}
      <Collapsible open={expandedSections.inauspicious} onOpenChange={() => toggleSection('inauspicious')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            凶神 ({inauspiciousShenSha.length})
          </span>
          <ChevronDown className={cn('h-4 w-4 text-red-600 transition-transform', expandedSections.inauspicious && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {inauspiciousShenSha.map((data) => (
            <ShenShaCard key={data.name} data={data} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// 神煞卡片
const ShenShaCard: React.FC<{ data: ShenShaRefInfo }> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const isAuspicious = data.type === 'auspicious';

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              isAuspicious ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
            )}
          >
            {data.name}
          </Badge>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t bg-muted/30">
          <div className="pt-2">
            <span className="text-xs font-medium text-muted-foreground">说明：</span>
            <p className="text-xs mt-0.5">{data.description}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">作用：</span>
            <p className="text-xs mt-0.5">{data.effect}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">查法：</span>
            <p className="text-xs mt-0.5 text-primary">{data.calculation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== 吉凶格部分 =====
const CombinationsSection: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    auspicious: false,
    inauspicious: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      {/* 吉格 */}
      <Collapsible open={expandedSections.auspicious} onOpenChange={() => toggleSection('auspicious')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            吉格 ({AUSPICIOUS_COMBINATIONS.length})
          </span>
          <ChevronDown className={cn('h-4 w-4 text-green-600 transition-transform', expandedSections.auspicious && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {AUSPICIOUS_COMBINATIONS.map((combo) => (
            <CombinationCard key={combo.name} combo={combo} />
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* 凶格 */}
      <Collapsible open={expandedSections.inauspicious} onOpenChange={() => toggleSection('inauspicious')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            凶格 ({INAUSPICIOUS_COMBINATIONS.length})
          </span>
          <ChevronDown className={cn('h-4 w-4 text-red-600 transition-transform', expandedSections.inauspicious && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {INAUSPICIOUS_COMBINATIONS.map((combo) => (
            <CombinationCard key={combo.name} combo={combo} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// 吉凶格卡片
const CombinationCard: React.FC<{ combo: typeof AUSPICIOUS_COMBINATIONS[number] }> = ({ combo }) => {
  const [expanded, setExpanded] = useState(false);
  const isAuspicious = combo.type === 'auspicious';

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              isAuspicious ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
            )}
          >
            {combo.name}
          </Badge>
          <span className="text-xs text-muted-foreground">{combo.combination}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t bg-muted/30">
          <div className="pt-2">
            <span className="text-xs font-medium text-muted-foreground">富贵层次：</span>
            <p className="text-xs mt-0.5">{combo.fortune}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">现代解读：</span>
            <p className="text-xs mt-0.5">{combo.modernMapping}</p>
          </div>
          {combo.advantages && combo.advantages.length > 0 && (
            <div>
              <span className="text-xs font-medium text-green-600">优点：</span>
              <ul className="mt-0.5 space-y-0.5">
                {combo.advantages.map((adv, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-green-500 shrink-0">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {combo.disadvantages && combo.disadvantages.length > 0 && (
            <div>
              <span className="text-xs font-medium text-red-500">缺点：</span>
              <ul className="mt-0.5 space-y-0.5">
                {combo.disadvantages.map((dis, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-red-500 shrink-0">✗</span>
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {combo.remedies && combo.remedies.length > 0 && (
            <div className={cn(
              'rounded p-2 border',
              isAuspicious 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            )}>
              <span className={cn(
                'text-xs font-medium flex items-center gap-1',
                isAuspicious ? 'text-blue-600' : 'text-amber-600'
              )}>
                {isAuspicious ? (
                  <>
                    <Lightbulb className="h-3 w-3" />
                    增运建议：
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3" />
                    化解方法：
                  </>
                )}
              </span>
              <ul className="mt-1 space-y-0.5">
                {combo.remedies.map((remedy, idx) => (
                  <li key={idx} className={cn(
                    'text-xs flex items-start gap-1',
                    isAuspicious ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'
                  )}>
                    <span className={isAuspicious ? 'text-blue-500' : 'text-amber-500'}>→</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BaziEncyclopedia;
