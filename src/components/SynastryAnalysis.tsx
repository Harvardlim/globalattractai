import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Users, Heart, Activity, UserCheck, Sparkles, MessageCircle, Link2, Star, ArrowLeftRight, Briefcase, HeartHandshake, ThumbsUp, ThumbsDown, Minus, UserPlus, Shield, Compass, TrendingUp } from "lucide-react";
import { ChartData } from "@/types";
import { analyzeBaziPattern, HEAVENLY_STEMS, STEM_ELEMENTS, ELEMENT_NAMES } from "@/lib/baziPatternAnalysis";
import { DAY_MASTER_PERSONALITIES } from "@/data/dayMasterPersonalityData";
import { NORMAL_PATTERNS } from "@/data/baziPatternData";
import { analyzeGeJu, GeJuInfo } from "@/lib/baziGeJuAnalysis";
import { getTenGodsSingleLabel } from "@/lib/ganzhiHelper";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { analyzeQimenChart, PALACE_PERSONALITY } from "@/data/qimenAnalysisData";
import { analyzeZhiFuZhiShi } from "@/data/zhifuZhishiData";
import { analyzeWealth } from "@/components/WealthAnalysisDisplay";
import { WEALTH_ARCHETYPES } from "@/data/wealthArchetypeData";

interface SynastryAnalysisProps {
  chart1: ChartData;
  chart2: ChartData;
  hideQimen?: boolean;
}

// 天干五合
const STEM_COMBINES: Record<string, string> = {
  '甲己': '中正之合',
  '乙庚': '仁义之合',
  '丙辛': '威制之合',
  '丁壬': '淫慝之合',
  '戊癸': '无情之合',
};

function getStemCombine(g1: string, g2: string): string | undefined {
  return STEM_COMBINES[g1 + g2] || STEM_COMBINES[g2 + g1];
}

// 五行生克
function getRelation(el1: number, el2: number): string {
  if (el1 === el2) return '比和';
  const genMap = new Map([[0,1],[1,2],[2,3],[3,4],[4,0]]);
  if (genMap.get(el1) === el2) return '我生';
  if (genMap.get(el2) === el1) return '生我';
  const clashMap = new Map([[0,2],[2,4],[4,1],[1,3],[3,0]]);
  if (clashMap.get(el1) === el2) return '我克';
  return '克我';
}

// ===== 地支关系检测 =====
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 六合
const LIU_HE: Record<string, string> = {
  '子丑': '子丑合（土）', '寅亥': '寅亥合（木）', '卯戌': '卯戌合（火）',
  '辰酉': '辰酉合（金）', '巳申': '巳申合（水）', '午未': '午未合（火）',
};

// 六冲
const LIU_CHONG: Record<string, string> = {
  '子午': '子午冲', '丑未': '丑未冲', '寅申': '寅申冲',
  '卯酉': '卯酉冲', '辰戌': '辰戌冲', '巳亥': '巳亥冲',
};

// 六害
const LIU_HAI: Record<string, string> = {
  '子未': '子未害', '丑午': '丑午害', '寅巳': '寅巳害',
  '卯辰': '卯辰害', '申亥': '申亥害', '酉戌': '酉戌害',
};

// 三合（检测两支是否属于同一三合局）
const SAN_HE_GROUPS: { branches: string[]; name: string }[] = [
  { branches: ['申', '子', '辰'], name: '申子辰三合水局' },
  { branches: ['寅', '午', '戌'], name: '寅午戌三合火局' },
  { branches: ['巳', '酉', '丑'], name: '巳酉丑三合金局' },
  { branches: ['亥', '卯', '未'], name: '亥卯未三合木局' },
];

// 三会（检测两支是否属于同一三会局）
const SAN_HUI_GROUPS: { branches: string[]; name: string }[] = [
  { branches: ['亥', '子', '丑'], name: '亥子丑三会水局' },
  { branches: ['寅', '卯', '辰'], name: '寅卯辰三会木局' },
  { branches: ['巳', '午', '未'], name: '巳午未三会火局' },
  { branches: ['申', '酉', '戌'], name: '申酉戌三会金局' },
];

// 刑
const XING_PAIRS: Record<string, string> = {
  '子卯': '子卯刑（无礼之刑）', '丑戌': '丑戌刑（恃势之刑）', '丑未': '丑未刑（恃势之刑）',
  '戌未': '戌未刑（恃势之刑）', '寅巳': '寅巳刑（无恩之刑）', '寅申': '寅申刑（无恩之刑）',
  '巳申': '巳申刑（无恩之刑）',
};

// 破
const PO_PAIRS: Record<string, string> = {
  '子酉': '子酉破', '丑辰': '丑辰破', '寅亥': '寅亥破',
  '卯午': '卯午破', '巳申': '巳申破', '未戌': '未戌破',
};

// 绝
const JUE_PAIRS: Record<string, string> = {
  '子巳': '子巳绝', '寅酉': '寅酉绝', '卯申': '卯申绝',
  '午亥': '午亥绝',
};

interface BranchRelation {
  type: string;
  name: string;
  color: string;
}

function detectBranchRelations(zhi1: string, zhi2: string): BranchRelation[] {
  const relations: BranchRelation[] = [];
  const pair = zhi1 + zhi2;
  const pairRev = zhi2 + zhi1;

  // 六合
  const he = LIU_HE[pair] || LIU_HE[pairRev];
  if (he) relations.push({ type: '六合', name: he, color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' });

  // 六冲
  const chong = LIU_CHONG[pair] || LIU_CHONG[pairRev];
  if (chong) relations.push({ type: '六冲', name: chong, color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' });

  // 六害
  const hai = LIU_HAI[pair] || LIU_HAI[pairRev];
  if (hai) relations.push({ type: '六害', name: hai, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' });

  // 刑
  const xing = XING_PAIRS[pair] || XING_PAIRS[pairRev];
  if (xing) relations.push({ type: '刑', name: xing, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' });

  // 破
  const po = PO_PAIRS[pair] || PO_PAIRS[pairRev];
  if (po) relations.push({ type: '破', name: po, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' });

  // 三合半合
  for (const group of SAN_HE_GROUPS) {
    if (group.branches.includes(zhi1) && group.branches.includes(zhi2)) {
      relations.push({ type: '三合半合', name: `${zhi1}${zhi2}（${group.name}之二）`, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' });
    }
  }

  // 三会半会
  for (const group of SAN_HUI_GROUPS) {
    if (group.branches.includes(zhi1) && group.branches.includes(zhi2)) {
      relations.push({ type: '三会半会', name: `${zhi1}${zhi2}（${group.name}之二）`, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' });
    }
  }

  // 绝
  const jue = JUE_PAIRS[pair] || JUE_PAIRS[pairRev];
  if (jue) relations.push({ type: '绝', name: jue, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300' });

  return relations;
}

// 地支关系解读
const RELATION_DESCRIPTIONS: Record<string, string> = {
  '六合': '两人日支六合，代表内在感情深厚，彼此有天然亲近感，婚姻或合作关系融洽。',
  '六冲': '两人日支六冲，代表性格差异大，容易产生冲突和矛盾，需要更多包容和沟通。',
  '六害': '两人日支相害，代表关系中容易有暗中伤害或不信任，需要真诚坦荡。',
  '刑': '两人日支相刑，代表容易因误解或固执引发冲突，需要特别注意沟通方式。',
  '破': '两人日支相破，代表关系中容易有破坏损耗，感情或合作易出现裂痕，需用心维护。',
  '三合半合': '两人日支属同一三合局，有共同目标和价值观，合作默契。',
  '三会半会': '两人日支属同一三会局，势力聚集方向一致，彼此有天然凝聚力。',
  '绝': '两人日支相绝，五行绝地，代表能量最弱的状态，关系中缺乏自然联结，需要主动经营。',
};

const SynastryAnalysis: React.FC<SynastryAnalysisProps> = ({ chart1, chart2, hideQimen = false }) => {
  const p1 = chart1.pillars;
  const p2 = chart2.pillars;

  const dayGan1 = p1.day.gan;
  const dayGan2 = p2.day.gan;
  const dayGanIdx1 = HEAVENLY_STEMS.indexOf(dayGan1);
  const dayGanIdx2 = HEAVENLY_STEMS.indexOf(dayGan2);
  const dayEl1 = STEM_ELEMENTS[dayGanIdx1];
  const dayEl2 = STEM_ELEMENTS[dayGanIdx2];

  const dayZhi1 = p1.day.zhi;
  const dayZhi2 = p2.day.zhi;

  const stemCombine = getStemCombine(dayGan1, dayGan2);
  const relation = getRelation(dayEl1, dayEl2);

  // 地支关系检测
  const branchRelations = detectBranchRelations(dayZhi1, dayZhi2);
  const personality1 = DAY_MASTER_PERSONALITIES[dayGan1];
  const personality2 = DAY_MASTER_PERSONALITIES[dayGan2];

  const pattern1 = analyzeBaziPattern(p1, true);
  const pattern2 = analyzeBaziPattern(p2, true);

  const strength1 = pattern1.dayMaster.strength === 'strong' ? '身强' : pattern1.dayMaster.strength === 'weak' ? '身弱' : '中和';
  const strength2 = pattern2.dayMaster.strength === 'strong' ? '身强' : pattern2.dayMaster.strength === 'weak' ? '身弱' : '中和';

  // 使用与命理盘相同的 analyzeGeJu 获取格局
  const geJuResult1 = analyzeGeJu(p1, true);
  const geJuResult2 = analyzeGeJu(p2, true);

  // 获取格局性格描述
  const getPatternInfo = (patternName: string) => {
    const cleanName = patternName.replace(/\(.*\)/, '').trim();
    const info = NORMAL_PATTERNS[cleanName];
    if (!info) return null;
    return { name: cleanName, info };
  };

  // 喜用神互补分析
  const fav1Elements = pattern1.favorableGods.map(g => g.elementName);
  const fav2Elements = pattern2.favorableGods.map(g => g.elementName);
  const unfav1Elements = pattern1.unfavorableGods.map(g => g.elementName);
  const unfav2Elements = pattern2.unfavorableGods.map(g => g.elementName);

  // 对方的日主五行是否是我的喜用神
  const el1Name = ELEMENT_NAMES[dayEl1];
  const el2Name = ELEMENT_NAMES[dayEl2];
  const person1IsNoble = fav2Elements.includes(el1Name); // 甲方五行是乙方的喜用
  const person2IsNoble = fav1Elements.includes(el2Name); // 乙方五行是甲方的喜用
  const person1IsHarm = unfav2Elements.includes(el1Name); // 甲方五行是乙方的忌神
  const person2IsHarm = unfav1Elements.includes(el2Name); // 乙方五行是甲方的忌神

  // 喜用神重叠
  const sharedFav = fav1Elements.filter(e => fav2Elements.includes(e));
  const sharedUnfav = unfav1Elements.filter(e => unfav2Elements.includes(e));
  // 互补：甲方喜用是乙方忌神 或 反之
  const complement1to2 = fav1Elements.filter(e => unfav2Elements.includes(e));
  const complement2to1 = fav2Elements.filter(e => unfav1Elements.includes(e));

  // 奇门分析
  const qimen1 = analyzeQimenChart(chart1.palaces, chart1.pillars.day.gan);
  const qimen2 = analyzeQimenChart(chart2.palaces, chart2.pillars.day.gan);
  const zhiFuZhiShi1 = analyzeZhiFuZhiShi(chart1.zhiFu, chart1.zhiShi, chart1.palaces);
  const zhiFuZhiShi2 = analyzeZhiFuZhiShi(chart2.zhiFu, chart2.zhiShi, chart2.palaces);

  // ====== 综合适配度评估 ======
  const computeCompatibility = () => {
    let romanceScore = 0;
    let romanceFactors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[] = [];
    let businessScore = 0;
    let businessFactors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[] = [];
    let friendScore = 0;
    let friendFactors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[] = [];
    let bossScore = 0;
    let bossFactors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[] = [];

    // 1. 天干合
    if (stemCombine) {
      romanceScore += 25;
      romanceFactors.push({ label: stemCombine, impact: 'positive', detail: '日干相合，天生吸引力强，默契度高' });
      businessScore += 10;
      businessFactors.push({ label: stemCombine, impact: 'positive', detail: '天干相合，沟通默契' });
      friendScore += 15;
      friendFactors.push({ label: stemCombine, impact: 'positive', detail: '天干相合，自然亲近，容易成为知己' });
      bossScore += 10;
      bossFactors.push({ label: stemCombine, impact: 'positive', detail: '天干相合，上下级默契度高' });
    }

    // 2. 五行关系
    if (relation === '比和') {
      romanceScore += 10;
      romanceFactors.push({ label: '日主比和', impact: 'neutral', detail: '性格相似，容易理解但缺乏互补' });
      businessScore += 5;
      businessFactors.push({ label: '日主比和', impact: 'neutral', detail: '思维相近，易达共识但创新不足' });
      friendScore += 20;
      friendFactors.push({ label: '日主比和', impact: 'positive', detail: '性格相似，兴趣相投，天生好友' });
      bossScore -= 5;
      bossFactors.push({ label: '日主比和', impact: 'negative', detail: '五行相同，缺乏上下级的自然层次感' });
    } else if (relation.includes('生')) {
      romanceScore += 15;
      romanceFactors.push({ label: `日主${relation}`, impact: 'positive', detail: '一方自然滋养另一方，关系有依托' });
      businessScore += 15;
      businessFactors.push({ label: `日主${relation}`, impact: 'positive', detail: '资源互补，一方支持另一方发展' });
      friendScore += 15;
      friendFactors.push({ label: `日主${relation}`, impact: 'positive', detail: '相处舒适，一方自然照顾另一方' });
      bossScore += 20;
      bossFactors.push({ label: `日主${relation}`, impact: 'positive', detail: '生扶关系，上级能滋养下属成长，下属愿意追随' });
    } else if (relation.includes('克')) {
      romanceScore -= 10;
      romanceFactors.push({ label: `日主${relation}`, impact: 'negative', detail: '克制关系，需注意强势一方的态度' });
      businessScore += 5;
      businessFactors.push({ label: `日主${relation}`, impact: 'neutral', detail: '有制约力，适合上下级但需尊重' });
      friendScore -= 5;
      friendFactors.push({ label: `日主${relation}`, impact: 'neutral', detail: '相处需注意边界，避免过度干涉' });
      bossScore += 10;
      bossFactors.push({ label: `日主${relation}`, impact: 'neutral', detail: '克制关系，有天然管控力，但需注意方式' });
    }

    // 3. 地支关系
    for (const r of branchRelations) {
      if (r.type === '六合') {
        romanceScore += 20;
        romanceFactors.push({ label: r.name, impact: 'positive', detail: '日支六合，内在感情深厚' });
        businessScore += 15;
        businessFactors.push({ label: r.name, impact: 'positive', detail: '六合关系，合作融洽' });
        friendScore += 20;
        friendFactors.push({ label: r.name, impact: 'positive', detail: '六合关系，相处融洽，友谊持久' });
        bossScore += 15;
        bossFactors.push({ label: r.name, impact: 'positive', detail: '六合，上下级关系和谐，互相信任' });
      } else if (r.type === '三合半合') {
        romanceScore += 10;
        romanceFactors.push({ label: r.name, impact: 'positive', detail: '志同道合，有共同目标' });
        businessScore += 20;
        businessFactors.push({ label: r.name, impact: 'positive', detail: '三合局，目标一致，合作最佳' });
        friendScore += 15;
        friendFactors.push({ label: r.name, impact: 'positive', detail: '三合局，志趣相投，有共同话题' });
        bossScore += 20;
        bossFactors.push({ label: r.name, impact: 'positive', detail: '三合局，目标一致，团队配合默契' });
      } else if (r.type === '六冲') {
        romanceScore -= 15;
        romanceFactors.push({ label: r.name, impact: 'negative', detail: '日支六冲，矛盾摩擦多' });
        businessScore -= 10;
        businessFactors.push({ label: r.name, impact: 'negative', detail: '六冲，意见分歧大' });
        friendScore -= 10;
        friendFactors.push({ label: r.name, impact: 'negative', detail: '六冲，性格差异大，容易起争执' });
        bossScore -= 15;
        bossFactors.push({ label: r.name, impact: 'negative', detail: '六冲，上下级理念冲突，执行力打折' });
      } else if (r.type === '六害') {
        romanceScore -= 10;
        romanceFactors.push({ label: r.name, impact: 'negative', detail: '日支相害，暗中消耗感情' });
        businessScore -= 5;
        businessFactors.push({ label: r.name, impact: 'negative', detail: '相害，信任度不足' });
        friendScore -= 10;
        friendFactors.push({ label: r.name, impact: 'negative', detail: '相害，容易互相猜疑，友谊不稳' });
        bossScore -= 10;
        bossFactors.push({ label: r.name, impact: 'negative', detail: '相害，上下级之间容易猜忌' });
      } else if (r.type === '刑') {
        romanceScore -= 10;
        romanceFactors.push({ label: r.name, impact: 'negative', detail: '日支相刑，固执引发冲突' });
        businessScore -= 5;
        businessFactors.push({ label: r.name, impact: 'negative', detail: '相刑，合作中易有摩擦' });
        friendScore -= 5;
        friendFactors.push({ label: r.name, impact: 'negative', detail: '相刑，需注意说话分寸' });
        bossScore -= 5;
        bossFactors.push({ label: r.name, impact: 'negative', detail: '相刑，工作中容易因固执产生矛盾' });
      } else if (r.type === '破') {
        romanceScore -= 8;
        romanceFactors.push({ label: r.name, impact: 'negative', detail: '日支相破，感情易出现裂痕' });
        businessScore -= 5;
        businessFactors.push({ label: r.name, impact: 'negative', detail: '相破，合作关系容易出现损耗' });
        friendScore -= 5;
        friendFactors.push({ label: r.name, impact: 'negative', detail: '相破，友谊需要用心维护' });
        bossScore -= 5;
        bossFactors.push({ label: r.name, impact: 'negative', detail: '相破，上下级关系容易产生裂痕' });
      } else if (r.type === '三会半会') {
        romanceScore += 12;
        romanceFactors.push({ label: r.name, impact: 'positive', detail: '三会局，方位凝聚，有天然向心力' });
        businessScore += 18;
        businessFactors.push({ label: r.name, impact: 'positive', detail: '三会局，势力聚集方向一致，团队合力强' });
        friendScore += 15;
        friendFactors.push({ label: r.name, impact: 'positive', detail: '三会局，价值观方向一致，凝聚力强' });
        bossScore += 18;
        bossFactors.push({ label: r.name, impact: 'positive', detail: '三会局，上下级方向一致，执行力集中' });
      } else if (r.type === '绝') {
        romanceScore -= 5;
        romanceFactors.push({ label: r.name, impact: 'negative', detail: '日支相绝，缺乏天然联结，需主动经营' });
        businessScore -= 3;
        businessFactors.push({ label: r.name, impact: 'negative', detail: '相绝，合作缺乏天然默契' });
        friendScore -= 3;
        friendFactors.push({ label: r.name, impact: 'negative', detail: '相绝，友谊需要主动维系' });
        bossScore -= 3;
        bossFactors.push({ label: r.name, impact: 'negative', detail: '相绝，上下级缺乏自然联结' });
      }
    }

    // 4. 贵人关系
    if (person1IsNoble && person2IsNoble) {
      romanceScore += 20;
      romanceFactors.push({ label: '互为贵人', impact: 'positive', detail: '双方日主五行互为喜用，天作之合' });
      businessScore += 25;
      businessFactors.push({ label: '互为贵人', impact: 'positive', detail: '互为喜用神，合作互利共赢' });
      friendScore += 20;
      friendFactors.push({ label: '互为贵人', impact: 'positive', detail: '互为贵人，彼此成就，友谊珍贵' });
      bossScore += 20;
      bossFactors.push({ label: '互为贵人', impact: 'positive', detail: '互为贵人，上下级互相成就' });
    } else if (person1IsNoble || person2IsNoble) {
      const helper = person1IsNoble ? chart1.name : chart2.name;
      romanceScore += 10;
      romanceFactors.push({ label: `${helper}是贵人`, impact: 'positive', detail: `${helper}对对方有正面助力` });
      businessScore += 15;
      businessFactors.push({ label: `${helper}是贵人`, impact: 'positive', detail: `${helper}能带动对方发展` });
      friendScore += 10;
      friendFactors.push({ label: `${helper}是贵人`, impact: 'positive', detail: `${helper}是对方的贵人朋友` });
      bossScore += 15;
      bossFactors.push({ label: `${helper}是贵人`, impact: 'positive', detail: `${helper}能提携对方，上下级受益` });
    }
    if (person1IsHarm && person2IsHarm) {
      romanceScore -= 15;
      romanceFactors.push({ label: '互为忌神', impact: 'negative', detail: '双方日主五行互为忌神，消耗大' });
      businessScore -= 15;
      businessFactors.push({ label: '互为忌神', impact: 'negative', detail: '互为忌神，合作消耗多于收获' });
      friendScore -= 15;
      friendFactors.push({ label: '互为忌神', impact: 'negative', detail: '互为忌神，相处容易消耗能量' });
      bossScore -= 15;
      bossFactors.push({ label: '互为忌神', impact: 'negative', detail: '互为忌神，上下级互相消耗' });
    }

    // 5. 喜用神互补
    if (sharedFav.length > 0) {
      businessScore += 10;
      businessFactors.push({ label: `共同喜用：${sharedFav.join('、')}`, impact: 'positive', detail: '发展方向一致，适合同行业' });
      friendScore += 10;
      friendFactors.push({ label: `共同喜用：${sharedFav.join('、')}`, impact: 'positive', detail: '兴趣方向一致，有共同爱好' });
      bossScore += 5;
      bossFactors.push({ label: `共同喜用`, impact: 'positive', detail: '发展方向一致，团队目标统一' });
    }
    if (complement1to2.length > 0 || complement2to1.length > 0) {
      romanceScore += 5;
      businessScore += 10;
      businessFactors.push({ label: '喜忌互补', impact: 'positive', detail: '一方喜用正好化解对方忌神' });
      friendScore += 5;
      friendFactors.push({ label: '喜忌互补', impact: 'positive', detail: '互补关系，能帮对方补短板' });
      bossScore += 10;
      bossFactors.push({ label: '喜忌互补', impact: 'positive', detail: '互补关系，上下级能力互补' });
    }

    // 6. 十神关系对上下级的影响
    const label1to2 = getTenGodsSingleLabel(dayGanIdx1, dayGanIdx2);
    const label2to1 = getTenGodsSingleLabel(dayGanIdx2, dayGanIdx1);
    if (label1to2 === '官' || label1to2 === '杀') {
      bossScore += 15;
      bossFactors.push({ label: `${chart2.name}为${chart1.name}的${label1to2 === '官' ? '正官' : '七杀'}`, impact: 'positive', detail: `${chart2.name}天然有管理${chart1.name}的能力` });
    } else if (label2to1 === '官' || label2to1 === '杀') {
      bossScore += 15;
      bossFactors.push({ label: `${chart1.name}为${chart2.name}的${label2to1 === '官' ? '正官' : '七杀'}`, impact: 'positive', detail: `${chart1.name}天然有管理${chart2.name}的能力` });
    }
    if ((label1to2 === '印' || label1to2 === '枭') || (label2to1 === '印' || label2to1 === '枭')) {
      bossScore += 10;
      bossFactors.push({ label: '有印星关系', impact: 'positive', detail: '有教导和培养的关系，适合师徒式上下级' });
    }

    // Clamp to 0-100
    romanceScore = Math.max(0, Math.min(100, 50 + romanceScore));
    businessScore = Math.max(0, Math.min(100, 50 + businessScore));
    friendScore = Math.max(0, Math.min(100, 50 + friendScore));
    bossScore = Math.max(0, Math.min(100, 50 + bossScore));

    return { romanceScore, romanceFactors, businessScore, businessFactors, friendScore, friendFactors, bossScore, bossFactors };
  };

  const compat = computeCompatibility();

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { text: '极佳', icon: <ThumbsUp className="h-4 w-4" />, color: 'text-green-600 dark:text-green-400' };
    if (score >= 60) return { text: '良好', icon: <ThumbsUp className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 40) return { text: '一般', icon: null, color: 'text-amber-600 dark:text-amber-400' };
    return { text: '需注意', icon: <ThumbsDown className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' };
  };

  const getAdvice = (score: number, type: 'romance' | 'business' | 'friend' | 'boss'): { tips: string[]; cautions: string[] } => {
    const adviceMap: Record<string, Record<string, { tips: string[]; cautions: string[] }>> = {
      romance: {
        high: { tips: ['两人天生默契，感情基础牢固，适合长期发展', '保持坦诚沟通，珍惜这份难得的缘分', '共同规划未来，建立稳定的家庭生活'], cautions: ['不要因为太过融洽而忽视个人空间', '偶尔的小矛盾是正常的，不必过度焦虑'] },
        good: { tips: ['关系有良好基础，用心经营可以很幸福', '多关注对方的情感需求，增进理解', '定期创造独处时光，维系感情温度'], cautions: ['注意沟通方式，避免因小事积累矛盾', '尊重彼此差异，求同存异是关键'] },
        average: { tips: ['需要双方共同努力，用包容化解差异', '找到共同兴趣爱好，增强情感联结', '学会换位思考，理解对方的立场'], cautions: ['避免冷战和回避问题，有矛盾及时沟通', '不要试图改变对方，接纳真实的彼此'] },
        low: { tips: ['如果选择在一起，需要比常人付出更多耐心', '建立清晰的沟通规则，减少误解', '各自保留独立空间，减少摩擦'], cautions: ['性格差异大，容易因小事引发大矛盾', '需警惕互相消耗的关系模式'] },
      },
      business: {
        high: { tips: ['合作前景极佳，适合深度绑定的合伙关系', '充分发挥各自优势，形成互补团队', '制定清晰的分工和利润分配机制'], cautions: ['合作再好也要有书面协议保障', '定期复盘合作效果，保持良性发展'] },
        good: { tips: ['合作基础良好，适合项目制或阶段性合作', '明确各自的职责边界和决策权限'], cautions: ['在财务问题上要格外清晰透明', '注意意见分歧时的处理方式'] },
        average: { tips: ['可以尝试小规模合作，观察磨合情况', '设定明确目标和考核标准'], cautions: ['不建议大额投资的深度合伙', '决策权归属要提前约定清楚'] },
        low: { tips: ['建议保持普通商业往来，不宜深度合伙', '如需合作，选择短期项目制为宜'], cautions: ['容易因理念不同产生分歧', '利益分配可能成为矛盾焦点'] },
      },
      friend: {
        high: { tips: ['天生好友，这段友谊值得珍惜和维护', '可以成为彼此的知己和精神支柱'], cautions: ['好友之间也需要适度的距离感', '避免在金钱上产生纠葛'] },
        good: { tips: ['友谊基础扎实，多创造相处机会', '分享彼此的喜怒哀乐，增进了解'], cautions: ['尊重对方的生活节奏和社交圈', '避免过度依赖或干涉对方私事'] },
        average: { tips: ['可以做朋友，但需要找到共同话题', '多参加共同活动，培养默契'], cautions: ['性格差异可能导致误解，多沟通', '友谊需要时间培养，不宜急于求成'] },
        low: { tips: ['保持礼貌性社交即可，不必强求深交', '如有交集，注意保持边界感'], cautions: ['相处容易产生摩擦，减少不必要的接触', '不必勉强自己维持不舒适的关系'] },
      },
      boss: {
        high: { tips: ['天生的上下级搭档，配合默契效率高', '上级给予空间和信任，下属全力执行', '建立良好的反馈机制，双向成长'], cautions: ['不要因为关系好而模糊公私边界', '保持适度的专业距离感'] },
        good: { tips: ['上下级关系融洽，沟通顺畅', '明确职责范围和汇报机制', '上级多给予认可，下属主动沟通进展'], cautions: ['注意决策权的边界，避免越俎代庖', '意见不同时以理服人'] },
        average: { tips: ['需要磨合期，建立清晰的工作流程', '上级多听取下属意见，下属积极反馈', '以结果为导向，减少过程中的摩擦'], cautions: ['避免命令式沟通，多用引导方式', '工作之外保持适当距离', '重要事项书面确认，减少误解'] },
        low: { tips: ['上下级关系需要特别经营', '建立明确的制度和流程来减少冲突', '引入第三方协调机制'], cautions: ['理念差异大，容易产生对立情绪', '下属可能不服管理，需要以德服人', '考虑是否适合直接上下级关系'] },
      },
    };
    const level = score >= 80 ? 'high' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'low';
    return adviceMap[type][level];
  };

  const getSummaryLine = (score: number, type: 'romance' | 'business' | 'friend' | 'boss'): string => {
    const lines: Record<string, Record<string, string>> = {
      romance: {
        high: `${chart1.name}与${chart2.name}天生一对，彼此吸引、互相成就，是令人羡慕的伴侣组合。`,
        good: `${chart1.name}与${chart2.name}感情基础良好，用心经营便能收获幸福。`,
        average: `${chart1.name}与${chart2.name}需要更多包容与理解，才能让感情走得更远。`,
        low: `${chart1.name}与${chart2.name}性格差异较大，在一起需要双方付出加倍努力。`,
      },
      business: {
        high: `${chart1.name}与${chart2.name}是天生的合作伙伴，强强联手、互利共赢。`,
        good: `${chart1.name}与${chart2.name}合作前景不错，明确分工便能取得好成绩。`,
        average: `${chart1.name}与${chart2.name}可以合作，但需建立清晰的规则和边界。`,
        low: `${chart1.name}与${chart2.name}合作需慎重，建议保持适度距离的商业往来。`,
      },
      friend: {
        high: `${chart1.name}与${chart2.name}是难得的知己，这份友谊值得一生珍惜。`,
        good: `${chart1.name}与${chart2.name}很适合做朋友，相处轻松愉快。`,
        average: `${chart1.name}与${chart2.name}可以做朋友，但需要找到适合的相处节奏。`,
        low: `${chart1.name}与${chart2.name}保持君子之交即可，不必强求深交。`,
      },
      boss: {
        high: `${chart1.name}与${chart2.name}是天生的上下级搭档，配合默契、效率倍增。`,
        good: `${chart1.name}与${chart2.name}上下级关系融洽，明确分工即可高效合作。`,
        average: `${chart1.name}与${chart2.name}的上下级关系需要磨合，建立清晰制度是关键。`,
        low: `${chart1.name}与${chart2.name}不太适合直接上下级关系，建议保持平级或间接协作。`,
      },
    };
    const level = score >= 80 ? 'high' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'low';
    return lines[type][level];
  };

  const renderVerdict = (score: number, factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[], type: 'romance' | 'business' | 'friend' | 'boss') => {
    const scoreInfo = getScoreLabel(score);
    const advice = getAdvice(score, type);
    const summary = getSummaryLine(score, type);
    return (
      <div className="space-y-2">
        {/* 总结评语 + 分数 - 始终可见 */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className={scoreInfo.color}
                strokeWidth="3" strokeDasharray={`${score * 0.97} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${scoreInfo.color}`}>{score}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-1.5 font-medium text-sm ${scoreInfo.color}`}>
              {scoreInfo.icon}
              <span>{scoreInfo.text}</span>
            </div>
            <p className={`text-xs mt-0.5 ${scoreInfo.color}`}>「{summary}」</p>
          </div>
        </div>
        {/* 详细分析 - 折叠 */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="h-3 w-3 transition-transform duration-200" />
            <span>查看详细分析</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3">
            <div className="space-y-1.5">
              {factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 mt-0.5 ${f.impact === 'positive' ? 'text-green-500' : f.impact === 'negative' ? 'text-red-500' : 'text-amber-500'}`}>
                    {f.impact === 'positive' ? '✦' : f.impact === 'negative' ? '✗' : '○'}
                  </span>
                  <span>
                    <span className="font-medium">{f.label}</span>
                    <span className="text-muted-foreground ml-1">— {f.detail}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">💡 相处建议</p>
                <ul className="space-y-0.5">
                  {advice.tips.map((t, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-green-500 shrink-0">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠️ 注意事项</p>
                <ul className="space-y-0.5">
                  {advice.cautions.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // Determine if we should hide sections that require full four-pillar data
  const hideFullAnalysis = hideQimen; // hideQimen is true when any party has no birth time

  const sections = [
    {
      icon: <HeartHandshake className="h-4 w-4" />,
      title: "综合适配度",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* 伴侣适配 */}
            <div className="rounded-lg p-3 border border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-900/10 space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-medium">适合做伴侣吗？</span>
              </div>
              {renderVerdict(compat.romanceScore, compat.romanceFactors, 'romance')}
            </div>
            {/* 合作适配 */}
            <div className="rounded-lg p-3 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">适合合作吗？</span>
              </div>
              {renderVerdict(compat.businessScore, compat.businessFactors, 'business')}
            </div>
            {/* 朋友适配 */}
            <div className="rounded-lg p-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">适合做朋友吗？</span>
              </div>
              {renderVerdict(compat.friendScore, compat.friendFactors, 'friend')}
            </div>
            {/* 上司下属适配 */}
            <div className="rounded-lg p-3 border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-medium">适合做上司下属吗？</span>
              </div>
              {renderVerdict(compat.bossScore, compat.bossFactors, 'boss')}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">* 评分基于八字日柱、地支关系、十神、喜用神互补等维度综合计算，仅供参考</p>
        </div>
      ),
    },
    {
      icon: <Compass className="h-4 w-4" />,
      title: "奇门盘对比",
      content: (
        <div className="space-y-4">
          {/* 命宫对比 */}
          <div className="space-y-2">
            <p className="text-xs font-medium">命宫对比</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: chart1.name, q: qimen1, chart: chart1 },
                { name: chart2.name, q: qimen2, chart: chart2 },
              ].map(({ name, q, chart: c }) => (
                <div key={name} className="rounded-lg p-2.5 bg-muted/50 border border-border space-y-1.5">
                  <p className="text-xs font-medium">{name}</p>
                  {q.mingGongPalace ? (
                    <>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5">{q.palaceTraits?.name ?? `${q.mingGongPalace.id}宫`}</Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground space-y-0.5">
                        <div>星：<span className="text-foreground">{q.mingGongPalace.star}</span></div>
                        <div>门：<span className="text-foreground">{q.mingGongPalace.door}</span></div>
                        <div>神：<span className="text-foreground">{q.mingGongPalace.god}</span></div>
                      </div>
                      {q.palaceTraits && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.palaceTraits.traits.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground">• {t}</span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">未能定位命宫</p>
                  )}
                </div>
              ))}
            </div>
            {/* 命宫关系解读 */}
            {qimen1.mingGongPalace && qimen2.mingGongPalace && (
              <div className="rounded-lg p-2 bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  {qimen1.mingGongPalace.id === qimen2.mingGongPalace.id
                    ? `两人命宫同落${qimen1.palaceTraits?.name ?? qimen1.mingGongPalace.id + '宫'}，性格底色相似，容易产生共鸣。`
                    : `${chart1.name}命宫在${qimen1.palaceTraits?.name ?? qimen1.mingGongPalace.id + '宫'}，${chart2.name}命宫在${qimen2.palaceTraits?.name ?? qimen2.mingGongPalace.id + '宫'}，性格底色不同，可形成互补。`
                  }
                </p>
              </div>
            )}
          </div>

          {/* 值符值使对比 */}
          <div className="space-y-2">
            <p className="text-xs font-medium">值符值使对比</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: chart1.name, zf: chart1.zhiFu, zs: chart1.zhiShi, rel: zhiFuZhiShi1 },
                { name: chart2.name, zf: chart2.zhiFu, zs: chart2.zhiShi, rel: zhiFuZhiShi2 },
              ].map(({ name, zf, zs, rel }) => {
                const typeColor = rel.type === '同宫' ? 'text-amber-600 dark:text-amber-400' :
                  rel.type === '相生' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                return (
                  <div key={name} className="rounded-lg p-2.5 bg-muted/50 border border-border space-y-1.5">
                    <p className="text-xs font-medium">{name}</p>
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <div>值符：<span className="text-foreground">{zf}</span>
                        {rel.zhiFuPalaceName && <span className="ml-1">（{rel.zhiFuPalaceName}）</span>}
                      </div>
                      <div>值使：<span className="text-foreground">{zs}</span>
                        {rel.zhiShiPalaceName && <span className="ml-1">（{rel.zhiShiPalaceName}）</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColor}`}>
                        {rel.subType || rel.type}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{rel.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: "八字格局对比",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[{ name: chart1.name, result: pattern1, geJuList: geJuResult1.geJuList, el: dayEl1, gan: dayGan1, strength: strength1 },
            { name: chart2.name, result: pattern2, geJuList: geJuResult2.geJuList, el: dayEl2, gan: dayGan2, strength: strength2 }].map(({ name, result, geJuList, el, gan, strength }) => {
            const hasGeJu = geJuList.length > 0;
            // 取第一个格局做性格解读（与命理盘优先级一致：日柱→月柱→时柱→年柱）
            const primaryPattern = hasGeJu ? getPatternInfo(geJuList[0].name) : null;
            return (
              <div key={name} className="space-y-2">
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">
                  日主: {gan} ({ELEMENT_NAMES[el]}) · {strength}
                </p>
                {/* 喜用神 */}
                {result.favorableGods.length > 0 && (
                  <div>
                    <span className="text-[10px] text-muted-foreground">喜用：</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {result.favorableGods.map((g, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 border-green-500/50 text-green-600">
                          {g.elementName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* 忌神 */}
                {result.unfavorableGods.length > 0 && (
                  <div>
                    <span className="text-[10px] text-muted-foreground">忌神：</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {result.unfavorableGods.map((g, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 border-red-500/50 text-red-600">
                          {g.elementName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* 格局 - 合并同名格局 */}
                <div className="flex flex-wrap gap-1 w-fit">
                  {hasGeJu ? (() => {
                    // Group by base pattern name (remove "(日柱)" suffix for grouping)
                    const grouped = new Map<string, typeof geJuList>();
                    for (const gj of geJuList) {
                      const baseName = gj.name.replace(/\(日柱\)$/, '').trim();
                      const key = baseName;
                      if (!grouped.has(key)) grouped.set(key, []);
                      grouped.get(key)!.push(gj);
                    }
                    return Array.from(grouped.entries()).map(([displayName, items], i) => (
                      <div key={i} className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs p-1 rounded bg-primary/10 text-primary">{displayName}</span>
                        {/* {items.map((gj, j) => (
                          <span key={j} className={cn("text-[10px] px-1.5 py-0.5 rounded",
                            gj.pillarName === '日柱' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                            gj.rule === 1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          )}>
                            {gj.pillarName}
                            ·{gj.pillarName === '日柱' ? '自坐' : gj.rule === 1 ? '有根' : '有气'}
                          </span>
                        ))} */}
                      </div>
                    ));
                  })() : (
                    <span className="text-xs text-muted-foreground">无格</span>
                  )}
                </div>
                {/* 格局性格解读 */}
                {/* {primaryPattern && (
                  <div className="rounded-lg p-2 bg-muted/50 border border-border space-y-1.5">
                    <p className="text-xs font-medium text-primary">{primaryPattern.name}性格</p>
                    <p className="text-[10px] text-muted-foreground">{primaryPattern.info.coreCharacteristics}</p>
                    <div>
                      <span className="text-[10px] text-muted-foreground">适合领域：</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {primaryPattern.info.modernFields.map((f, i) => (
                          <span key={i} className="text-[10px] px-1 py-0 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">忌讳：</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {primaryPattern.info.fears.map((f, i) => (
                          <span key={i} className="text-[10px] px-1 py-0 rounded bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )} */}
                {/* 无格特征 */}
                {/* {!hasGeJu && (
                  <div className="rounded-lg p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-[10px] text-amber-700 dark:text-amber-300">无格局：思维跳跃、求新求变、适应力强，需明确目标踏实执行。</p>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>
      ),
    },
    {
      icon: <Star className="h-4 w-4" />,
      title: "喜用神互补分析",
      content: (
        <div className="space-y-3">
          {/* 互为贵人判断 */}
          <div className="space-y-2">
            <p className="text-xs font-medium">贵人关系判定</p>
            <div className="space-y-1.5">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{chart1.name}（{ELEMENT_NAMES[dayEl1]}）→ {chart2.name}</span>
                {person1IsNoble ? (
                  <Badge className="w-fit text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0">✦ 贵人</Badge>
                ) : person1IsHarm ? (
                  <Badge className="w-fit text-[10px] px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0">忌神冲突</Badge>
                ) : (
                  <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0">中性</Badge>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{chart2.name}（{ELEMENT_NAMES[dayEl2]}）→ {chart1.name}</span>
                {person2IsNoble ? (
                  <Badge className="w-fit text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0">✦ 贵人</Badge>
                ) : person2IsHarm ? (
                  <Badge className="w-fit text-[10px] px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0">忌神冲突</Badge>
                ) : (
                  <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0">中性</Badge>
                )}
              </div>
            </div>
            {person1IsNoble && person2IsNoble && (
              <div className="rounded-lg p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300">🌟 互为贵人：两人日主五行正好是对方的喜用神，天生互补互助，合作或感情关系极佳。</p>
              </div>
            )}
            {person1IsNoble && !person2IsNoble && (
              <p className="text-xs text-muted-foreground">{chart1.name}是{chart2.name}的贵人，{chart1.name}对{chart2.name}帮助较大。</p>
            )}
            {!person1IsNoble && person2IsNoble && (
              <p className="text-xs text-muted-foreground">{chart2.name}是{chart1.name}的贵人，{chart2.name}对{chart1.name}帮助较大。</p>
            )}
            {person1IsHarm && person2IsHarm && (
              <div className="rounded-lg p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300">⚠️ 互为忌神：两人日主五行恰好是对方的忌神，相处容易产生消耗，需加倍包容理解。</p>
              </div>
            )}
          </div>

          {/* 喜用神重叠与互补 */}
          <div className="space-y-2">
            <p className="text-xs font-medium">喜忌对比</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">{chart1.name} 喜用：</span>
                <div className="flex flex-wrap gap-1">
                  {fav1Elements.length > 0 ? fav1Elements.map((e, i) => (
                    <Badge key={i} variant="outline" className={cn("text-[10px] px-1 py-0", fav2Elements.includes(e) ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/30" : "")}>
                      {e}{fav2Elements.includes(e) ? ' ✓' : ''}
                    </Badge>
                  )) : <span className="text-[10px] text-muted-foreground">-</span>}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">{chart2.name} 喜用：</span>
                <div className="flex flex-wrap gap-1">
                  {fav2Elements.length > 0 ? fav2Elements.map((e, i) => (
                    <Badge key={i} variant="outline" className={cn("text-[10px] px-1 py-0", fav1Elements.includes(e) ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/30" : "")}>
                      {e}{fav1Elements.includes(e) ? ' ✓' : ''}
                    </Badge>
                  )) : <span className="text-[10px] text-muted-foreground">-</span>}
                </div>
              </div>
            </div>
            {sharedFav.length > 0 && (
              <p className="text-xs text-muted-foreground">共同喜用：<span className="text-green-600 font-medium">{sharedFav.join('、')}</span>，两人在相同方向上受益，适合同行同业。</p>
            )}
            {sharedUnfav.length > 0 && (
              <p className="text-xs text-muted-foreground">共同忌神：<span className="text-red-600 font-medium">{sharedUnfav.join('、')}</span>，需共同规避此类五行带来的负面影响。</p>
            )}
            {(complement1to2.length > 0 || complement2to1.length > 0) && (
              <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  互补关系：
                  {complement1to2.length > 0 && `${chart1.name}的喜用（${complement1to2.join('、')}）是${chart2.name}的忌神，可助其化解。`}
                  {complement2to1.length > 0 && `${chart2.name}的喜用（${complement2to1.join('、')}）是${chart1.name}的忌神，可助其化解。`}
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    (() => {
      // 十神关系计算
      const TEN_GOD_FULL: Record<string, string> = {
        '比': '比肩', '劫': '劫财', '食': '食神', '伤': '伤官',
        '才': '偏财', '财': '正财', '杀': '七杀', '官': '正官',
        '枭': '偏印', '印': '正印',
      };
      const TEN_GOD_DESC: Record<string, string> = {
        '比肩': '如同兄弟，竞争合作并存，彼此平等对待。',
        '劫财': '如同对手，在资源和感情上容易产生竞争。',
        '食神': '代表付出与照顾，一方自然愿意为另一方奉献。',
        '伤官': '代表才华展示，一方会激发另一方的表现欲和创造力。',
        '偏财': '代表意外之财和社交缘分，相处轻松愉快。',
        '正财': '代表稳定收入和务实关系，适合长期合作。',
        '七杀': '代表压力与挑战，一方对另一方形成管束力。',
        '正官': '代表正当管理，关系中有规矩和边界感。',
        '偏印': '代表偏门智慧，一方给另一方带来非传统的启发。',
        '正印': '代表关爱与庇护，一方如长辈般照顾另一方。',
      };

      const label1to2 = getTenGodsSingleLabel(dayGanIdx1, dayGanIdx2);
      const label2to1 = getTenGodsSingleLabel(dayGanIdx2, dayGanIdx1);
      const full1to2 = TEN_GOD_FULL[label1to2] || label1to2;
      const full2to1 = TEN_GOD_FULL[label2to1] || label2to1;

      return {
        icon: <ArrowLeftRight className="h-4 w-4" />,
        title: "十神关系对比",
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {/* Person 2 in Person 1's chart */}
              <div className="rounded-lg p-3 bg-muted/50 border border-border space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">{chart2.name} 在 {chart1.name} 命局中是：</span>
                  <Badge className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-0">{full1to2}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {chart1.name}（{dayGan1}·{ELEMENT_NAMES[dayEl1]}）视 {chart2.name}（{dayGan2}·{ELEMENT_NAMES[dayEl2]}）为「{full1to2}」。
                </p>
                {TEN_GOD_DESC[full1to2] && (
                  <p className="text-xs text-muted-foreground">{TEN_GOD_DESC[full1to2]}</p>
                )}
              </div>
              {/* Person 1 in Person 2's chart */}
              <div className="rounded-lg p-3 bg-muted/50 border border-border space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">{chart1.name} 在 {chart2.name} 命局中是：</span>
                  <Badge className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-0">{full2to1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {chart2.name}（{dayGan2}·{ELEMENT_NAMES[dayEl2]}）视 {chart1.name}（{dayGan1}·{ELEMENT_NAMES[dayEl1]}）为「{full2to1}」。
                </p>
                {TEN_GOD_DESC[full2to1] && (
                  <p className="text-xs text-muted-foreground">{TEN_GOD_DESC[full2to1]}</p>
                )}
              </div>
            </div>
            {/* 综合解读 */}
            <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {full1to2 === full2to1
                  ? `两人互为「${full1to2}」，关系对称平等，${full1to2 === '比肩' ? '如兄弟般相互扶持' : full1to2 === '劫财' ? '竞争意识强烈，需注意分寸' : '彼此感受相似'}。`
                  : `关系不对称：${chart1.name}视对方为「${full1to2}」，${chart2.name}视对方为「${full2to1}」。${
                    (label1to2 === '印' || label1to2 === '枭') && (label2to1 === '食' || label2to1 === '伤')
                      ? '一方滋养，一方回馈，关系互补。'
                      : (label1to2 === '官' || label1to2 === '杀') && (label2to1 === '财' || label2to1 === '才')
                      ? '一方主导管理，一方提供资源支持。'
                      : '双方在关系中扮演不同角色，需要相互理解。'
                  }`
                }
              </p>
            </div>
          </div>
        ),
      };
    })(),
    {
      icon: <Link2 className="h-4 w-4" />,
      title: "日支关系分析",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">日支：</span>
            <span className="text-sm font-medium text-primary">{dayZhi1} ↔ {dayZhi2}</span>
          </div>
          {branchRelations.length > 0 ? (
            <div className="space-y-2">
              {branchRelations.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded font-medium", r.color)}>{r.type}</span>
                    <span className="text-xs text-muted-foreground">{r.name}</span>
                  </div>
                  {RELATION_DESCRIPTIONS[r.type] && (
                    <p className="text-xs text-muted-foreground ml-1">{RELATION_DESCRIPTIONS[r.type]}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">两人日支无特殊关系（无合、冲、刑、害），关系较为中性平淡。</p>
          )}
        </div>
      ),
    },
    {
      icon: <UserCheck className="h-4 w-4" />,
      title: "性格分析",
      content: personality1 && personality2 ? (
        <div className="grid grid-cols-2 gap-4">
          {[{ name: chart1.name, p: personality1, gan: dayGan1 }, { name: chart2.name, p: personality2, gan: dayGan2 }].map(({ name, p, gan }) => (
            <div key={name} className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <p className="font-medium text-sm">{name}</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 w-fit">
                  {gan}{p.element}命 · {p.polarity}{p.element}
                </Badge>
              </div>
              <p className="text-xs font-medium text-primary">{p.nickname}</p>
              <p className="text-xs text-muted-foreground">{p.elementTraits}</p>
              <div>
                <p className="text-xs font-medium text-green-600">优点</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {p.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-amber-600">注意</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {p.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">数据不足</p>,
    },
    {
      icon: <Heart className="h-4 w-4" />,
      title: "感情婚姻",
      content: (
        <div className="space-y-3">
          {/* 天干关系 */}
          <div className="flex flex-col gap-2 flex-wrap">
            <span className="text-sm font-medium">日柱天干关系</span>
            <span className={cn(
              "text-sm px-2 py-0.5 rounded w-fit",
              stemCombine ? "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300" :
              relation === '比和' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" :
              relation.includes('生') ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
              "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
            )}>
              {dayGan1}({ELEMENT_NAMES[dayEl1]}) ↔ {dayGan2}({ELEMENT_NAMES[dayEl2]})
              {stemCombine ? ` · ${stemCombine}` : ` · ${relation}`}
            </span>
          </div>
          {stemCombine && (
            <p className="text-sm text-muted-foreground">
              两人日柱天干相合（{stemCombine}），代表自然吸引力强，容易产生默契。合中有情，适合长期关系。
            </p>
          )}
          {!stemCombine && relation === '比和' && (
            <p className="text-sm text-muted-foreground">
              两人日主五行相同，性格相似，容易理解彼此，但也可能因过于相似而缺乏互补。
            </p>
          )}
          {!stemCombine && relation.includes('生') && (
            <p className="text-sm text-muted-foreground">
              两人日主存在生扶关系，{relation === '我生' ? `${chart1.name}付出较多` : `${chart2.name}付出较多`}，关系中自然形成支持格局。
            </p>
          )}
          {!stemCombine && relation.includes('克') && (
            <p className="text-sm text-muted-foreground">
              两人日主存在克制关系，需要注意沟通方式，{relation === '我克' ? `${chart1.name}较强势` : `${chart2.name}较强势`}。适当让步可促进和谐。
            </p>
          )}

          {/* 双方感情风格 */}
          {personality1?.relationship && personality2?.relationship && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[{ name: chart1.name, r: personality1.relationship, gan: dayGan1, p: personality1 },
                { name: chart2.name, r: personality2.relationship, gan: dayGan2, p: personality2 }].map(({ name, r, gan, p }) => (
                <div key={name} className="space-y-2 rounded-lg p-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                  <div className="flex flex-col gap-1">
                    {/* <p className="text-xs font-medium text-pink-600">{name}（{gan}{p.element}）</p> */}
                    <p className="text-xs font-medium text-pink-600">{name}</p>
                    <p className="text-xs font-medium text-pink-600">{r.style}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-green-600">感情优点</p>
                    <ul className="text-[10px] text-muted-foreground list-disc list-inside">
                      {r.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-amber-600">感情挑战</p>
                    <ul className="text-[10px] text-muted-foreground list-disc list-inside">
                      {r.challenges.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex flex-col">
                    <span className="font-medium mb-0">理想伴侣：</span>
                    <span className="text-[10px] text-muted-foreground">{r.idealPartner}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground flex flex-col">
                    <span className="font-medium">婚姻建议：</span>
                    <span>{r.advice}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      title: "人际沟通",
      content: personality1?.communication && personality2?.communication ? (
        <div className="grid grid-cols-2 gap-4">
          {[{ name: chart1.name, c: personality1.communication, gan: dayGan1, p: personality1 },
            { name: chart2.name, c: personality2.communication, gan: dayGan2, p: personality2 }].map(({ name, c, gan, p }) => (
            <div key={name} className="space-y-2">
              <div className="flex flex-col gap-1.5 mb-4">
                <p className="font-medium text-sm">{name}</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 w-fit">{gan}{p.element}</Badge>
              </div>
              <p className="text-xs text-primary font-medium">{c.approach}</p>
              <div>
                <p className="text-xs font-medium text-green-600">如何沟通</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {c.tips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-red-600">沟通禁忌</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {c.avoid.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">数据不足</p>,
    },
    {
      icon: <Activity className="h-4 w-4" />,
      title: "健康对比",
      content: personality1?.health && personality2?.health ? (
        <div className="grid grid-cols-2 gap-4">
          {[{ name: chart1.name, h: personality1.health, gan: dayGan1, p: personality1 },
            { name: chart2.name, h: personality2.health, gan: dayGan2, p: personality2 }].map(({ name, h, gan, p }) => (
            <div key={name} className="space-y-1">
              <div className="flex flex-col gap-1.5 mb-4">
                <p className="font-medium text-sm">{name}</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 w-fit">{gan}{p.element}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {h.focus.map((f, i) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">{f}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{h.advice}</p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">数据不足</p>,
    },
    // 创富原型对比 (only when both have qimen charts)
    ...(!hideQimen ? [(() => {
      const wealth1 = analyzeWealth(chart1);
      const wealth2 = analyzeWealth(chart2);
      if (!wealth1 || !wealth2) return null;

      // 核心逻辑：以第一人需要的辅星来看，第二人有没有第一人要的星
      const person1NeedsStar = wealth1.archetype.auxiliaryStars; // 辅星描述文字
      const person2HasStar = wealth2.star; // 第二人的主导星
      const person2MatchesNeed = person1NeedsStar.includes(person2HasStar);

      // 同时也列出第二人盘中所有九星，看有没有第一人需要的
      const allStarsInChart2 = chart2.palaces.map((p: any) => p.star).filter(Boolean) as string[];
      const neededStarNames = Object.keys(WEALTH_ARCHETYPES).filter(s => person1NeedsStar.includes(s));
      const matchedStarsInChart2 = neededStarNames.filter(s => allStarsInChart2.includes(s));

      return {
        icon: <TrendingUp className="h-4 w-4" />,
        title: "创富原型对比",
        content: (
          <div className="space-y-3">
            {/* 第一人的创富原型 */}
            <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{chart1.name}（第一人）</p>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-bold text-sm">{wealth1.archetype.title}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{wealth1.archetype.subtitle}</span>
              </div>
              <p className="text-xs text-muted-foreground">{wealth1.archetype.wealthCode.slice(0, 60)}...</p>
              <p className="text-[10px] text-muted-foreground">取自：{wealth1.selectionReason}（{wealth1.palace.name}）</p>
              <div className="mt-1 pt-1 border-t border-amber-200/50 dark:border-amber-800/30">
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">需要调用的辅星：</p>
                <p className="text-[11px] text-muted-foreground">{wealth1.archetype.auxiliaryStars}</p>
              </div>
            </div>

            {/* 第二人的星 */}
            <div className="rounded-lg p-3 bg-muted/30 border border-border/50 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{chart2.name}（第二人）</p>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold text-sm">{wealth2.archetype.title}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{wealth2.archetype.subtitle}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">取自：{wealth2.selectionReason}（{wealth2.palace.name}）</p>
            </div>

            {/* 核心判断：第二人有没有第一人要的星 */}
            <div className={cn("rounded-lg p-3 border text-xs space-y-1", person2MatchesNeed ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-muted/30 border-border/50")}>
              <p className="font-medium text-sm">
                {person2MatchesNeed ? '✅ 对方主导星正是你需要的辅星！' : '⚠️ 对方主导星非你需要的辅星'}
              </p>
              <p className="text-muted-foreground">
                {person2MatchesNeed
                  ? `${chart2.name}的主导星「${person2HasStar}」正好是${chart1.name}创富路上需要调用的辅星，合作互补度极高！`
                  : `${chart2.name}的主导星「${person2HasStar}」不在${chart1.name}需要的辅星之列（${neededStarNames.join('、')}），但仍可带来不同视角。`
                }
              </p>
              {matchedStarsInChart2.length > 0 && !person2MatchesNeed && (
                <p className="text-green-600 dark:text-green-400 mt-1">
                  不过，{chart2.name}的盘中有「{matchedStarsInChart2.join('、')}」，仍具备辅星能量。
                </p>
              )}
            </div>
          </div>
        ),
      };
    })()].filter(Boolean) as any[] : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 py-2 border-b border-border">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">合盘分析</h2>
      </div>

      {sections.filter(s => {
        if (hideQimen && s.title === '奇门盘对比') return false;
        if (hideFullAnalysis && ['八字格局对比', '健康对比', '十神关系对比', '喜用神互补分析'].includes(s.title)) return false;
        return true;
      }).map((section, idx) => (
        <Collapsible key={idx} defaultOpen={false}>
          <Card className="border-border/50">
            <CollapsibleTrigger className="w-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium text-sm">{section.title}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                {section.content}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

export default SynastryAnalysis;
