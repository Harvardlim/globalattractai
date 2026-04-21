import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Heart, Briefcase, User, MessageCircle, Layers, Home, MapPin, Users, Activity, Package, Clock, Lightbulb, Crown, Swords, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { 
  EIGHT_GATES, 
  NINE_STARS, 
  EIGHT_GODS, 
  STEMS,
  NINE_PALACES,
  QimenSymbolInfo,
  PalaceInfo
} from "@/data/qimenEncyclopediaData";
import { ZHIFU_KNOWLEDGE, ZHISHI_KNOWLEDGE, ZhiFuZhiShiKnowledge } from "@/data/zhifuZhishiData";
import { getDoorPalaceHexagram, getStarDoorHexagram, HexagramInfo } from "@/lib/qimenHexagram";

// 性质颜色映射
const NATURE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  auspicious: { bg: 'bg-green-500/20', text: 'text-green-600', border: 'border-green-500/30' },
  inauspicious: { bg: 'bg-rose-500/20', text: 'text-rose-600', border: 'border-rose-500/30' },
  neutral: { bg: 'bg-slate-500/20', text: 'text-slate-600', border: 'border-slate-500/30' },
};

const NATURE_LABELS: Record<string, string> = {
  auspicious: '吉',
  inauspicious: '凶',
  neutral: '中',
};

// 十干克应数据（来自 shiGanKeYing.ts）
const STEMS_LIST = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

interface KeYingItem {
  sky: string;
  earth: string;
  name: string;
  summary: string;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
  details: {
    origin: string;        // 象意来源
    career: string;        // 事业
    wealth: string;        // 求财
    marriage: string;      // 婚姻感情
    lawsuit: string;       // 诉讼官司
    health: string;        // 健康
    travel: string;        // 出行
    advice: string;        // 应对建议
  };
}

// 完整的十干克应数据（依据《御定奇门宝鉴》）
const KE_YING_DATA: KeYingItem[] = [
  // 天盘甲
  { 
    sky: '甲', earth: '甲', 
    // name: '伏吟', 
    // summary: '凡事闭塞，静守为吉，不宜动作', 
    name: '青龙入地', 
    summary: '甲甲比肩，名谓伏吟。回环辗转，进退未决，占信，则喜信必来。门合则美，门塞星凶，空有财至。适合养精蓄锐，等待机遇，其意义相当于潜龙勿用。遇此，凡事不利，道路闭塞，以守为好。', 
    nature: 'neutral',
    details: {
      origin: '甲木遁入甲戊己下，天地盘同宫，主事物停滞不前',
      career: '事业停滞，升迁无望，宜守不宜攻。工作中容易遇到瓶颈，难有突破',
      wealth: '财运平平，投资勿动，守成为上。不宜开展新项目或扩大经营',
      marriage: '感情进展缓慢，已婚者关系稳定但缺乏激情，未婚者难遇良缘',
      lawsuit: '官司僵持，短期难有结果，宜调解和解',
      health: '旧疾复发，慢性病需持续调养，不宜手术',
      travel: '出行不顺，易有阻碍延误，不宜远行',
      advice: '静待时机，修身养性，不可强求，待运势转变再行动'
    }
  },
  { 
    sky: '甲', earth: '乙', 
    name: '青龙合会', 
    // summary: '贵人助，合主病多，吉凶看门', 
    summary: '甲己会合，因甲乙均位于东方青龙之位，所以又叫青龙和会，会得到同事，朋友的帮助，凡事主客均利，有利于谒贵，面试，门吉事也吉，门凶事也区。',
    nature: 'auspicious',
    details: {
      origin: '甲乙同属木，阴阳相合，如龙凤呈祥之象',
      career: '事业有贵人相助，合作项目顺利，团队协作良好',
      wealth: '财运亨通，合作求财大利，投资有回报',
      marriage: '姻缘和合，感情甜蜜，利于订婚嫁娶',
      lawsuit: '诉讼宜和解，有人从中调解，化干戈为玉帛',
      health: '合主病多，需注意肝胆脾胃，药物调理为主',
      travel: '出行顺利，结伴而行更佳，利于商旅',
      advice: '借助贵人之力，把握合作机会，但需注意身体调养'
    }
  },
  { 
    sky: '甲', earth: '丙', name: '青龙返首', 
    // summary: '大吉大利，若逢击刑则吉事成凶', 
    summary: '因青龙甲木生助丙火，故为青龙返首，如宫门无克，则大吉大利。如宫门相克，则诸事费力才成。又主土木动作，宅室光辉，父子大利。门克宫则利客，宫克门则利主，但本局虽吉利，却忌讳遇到六仪击刑，门迫以及奇仪入墓。若逢迫墓击刑，吉事成凶。',
    nature: 'auspicious',
    details: {
      origin: '甲木生丙火，如青龙回首顾盼，主贵人眷顾',
      career: '事业腾飞，升迁有望，领导赏识，可担重任',
      wealth: '财源广进，投资获利，贵人带财，横财可期',
      marriage: '桃花旺盛，感情热烈，利于求婚表白',
      lawsuit: '官司大胜，贵人相助，邪不胜正',
      health: '精力充沛，但需防肝火旺盛，注意眼睛',
      travel: '出行大吉，逢凶化吉，贵人护佑',
      advice: '把握良机，大胆进取，但需防小人暗算，击刑时需谨慎'
    }
  },
  { 
    sky: '甲', earth: '丁', name: '青龙耀明', 
    // summary: '谒贵求名吉，击刑则减吉', 
    summary: '因甲木青龙生助丁火，故为青龙耀明，宜见上级领导、贵人、求功名，为事吉利。主得暗助，又主凡事迅速，此格对工作，官职，学业，文化，事业等大利。对占断官司则不利，尤其门凶时则更凶。若值墓迫，招惹是非。',
    nature: 'auspicious',
    details: {
      origin: '甲木生丁火，木火通明之象，主文昌显达',
      career: '利于考试晋升，文职工作顺遂，学术研究有成',
      wealth: '文财较旺，技术求财有利，偏财运一般',
      marriage: '感情浪漫，文雅之人缘分佳，利于文人雅士',
      lawsuit: '诉讼得理，文书有利，证据充分',
      health: '心火旺盛，注意心血管，失眠需调理',
      travel: '利于求学考察，学术交流，文化之旅',
      advice: '发挥文才，求名求学皆宜，但需控制情绪，避免冲动'
    }
  },
  { 
    sky: '甲', earth: '戊', 
    // name: '青龙伏吟', 
    // summary: '凡事闭塞，静守为吉，不宜动作', 
    name: '青龙入地',
    summary: '甲甲比肩，名谓伏吟。回环辗转，进退未决，占信，则喜信必来。门合则美，门塞星凶，空有财至。适合养精蓄锐，等待机遇，其意义相当于潜龙勿用。遇此，凡事不利，道路闭塞，以守为好。',
    nature: 'neutral',
    details: {
      origin: '甲遁于戊下，甲戊同宫为伏吟，主事物反复',
      career: '工作重复劳累，难有新进展，需耐心等待',
      wealth: '财运反复，投资观望为宜，不宜冒险',
      marriage: '感情原地踏步，需要双方共同努力突破',
      lawsuit: '官司拖延，证据不足，短期难判',
      health: '脾胃不和，消化系统需注意，饮食宜清淡',
      travel: '出行多阻滞，行程易变，做好备用方案',
      advice: '韬光养晦，积蓄力量，等待转机，切勿急躁'
    }
  },
  { 
    sky: '甲', earth: '己', 
    // name: '贵人入狱', 
    // summary: '公私不利，凡事受阻，需冲开方好', 
    name: '青龙相合', 
    summary: '主有财运，婚姻之喜，若门生宫及比合，则主百事吉，门克宫则好事成蹉跎，有始无终。此格不利求贵与面试，因为戌为戊土之墓，故为贵人入狱，公私皆不利。宜踏实稳步，齐心协力。', 
    nature: 'inauspicious',
    details: {
      origin: '甲己相合但己土暗昧，如贵人落入困境，有才难施',
      career: '事业受阻，小人当道，上司刁难，才华被埋没',
      wealth: '财运受困，资金周转不灵，投资易套牢',
      marriage: '感情受困，第三者插足，家庭矛盾多',
      lawsuit: '官司不利，证人反水，有冤难伸',
      health: '脾胃湿困，身体沉重，精神萎靡',
      travel: '出行不利，易遇阻滞，证件问题多',
      advice: '找到突破口，借助外力冲开困局，不可坐以待毙'
    }
  },
  { 
    sky: '甲', earth: '庚', 
    // name: '值符飞宫', 
    // summary: '换地易迁，吉事不吉，凶事更凶', 
    name: '青龙失势',
    summary: '甲最怕庚金克杀，故为值符飞宫，吉事不吉，区事更凶，求财没利益，测病也主凶，防不测之灾，如入虎穴，如单身探敌宫。又为太白登天门格，如门制宫则凶，如见天辅星，则大利考试。同时，甲庚相冲，飞宫也主换地方。',
    nature: 'inauspicious',
    details: {
      origin: '甲庚相冲克，金克木，如贵人遭害，主大变动',
      career: '工作变动，可能被裁员调岗，领导更换',
      wealth: '财运大损，投资失利，破财在所难免',
      marriage: '感情破裂，争吵激烈，婚姻危机',
      lawsuit: '官司大败，对方强势，损失惨重',
      health: '肝胆受损，外伤风险高，手术需慎重',
      travel: '出行危险，车祸意外风险，尽量避免',
      advice: '能避则避，不可硬拼，退一步海阔天空，另谋他途'
    }
  },
  { 
    sky: '甲', earth: '辛', name: '青龙折足', 
    // summary: '吉门尚可，凶门失财，防足疾', 
    summary: '因辛金克甲木，子午相冲，故为青龙折足，吉门有生肋，尚能谋事，若逢凶门，主招灾、失财或有足疾、折伤。',
    nature: 'inauspicious',
    details: {
      origin: '辛金克甲木，但力量较轻，如龙足受伤，行动受限',
      career: '事业受小挫，虽有困难但可克服，需谨慎应对',
      wealth: '财运小损，投资需谨慎，避免冒进',
      marriage: '感情有小波折，沟通不畅，需要耐心',
      lawsuit: '官司有失，但损失可控，宜调解',
      health: '四肢筋骨受损，注意足部疾病，骨折风险',
      travel: '出行不太顺利，注意脚部安全，防跌倒',
      advice: '吉门可行，凶门止步，量力而行，稳中求进'
    }
  },
  { 
    sky: '甲', earth: '壬', 
    // name: '青龙天牢', 
    // summary: '诸事不利，投资亏本，测病主凶', 
    name: '蛇入地罗', 
    summary: '外人缠绕，内事索索，吉门吉星，庶免蹉跎。凡事破败难定。', 
    nature: 'inauspicious',
    details: {
      origin: '壬水泄甲木元气，如龙困天牢，有力难施',
      career: '事业困顿，项目搁浅，资源被抽调',
      wealth: '投资大亏，资金链断裂，经济困难',
      marriage: '感情冷淡，双方心不在焉，缺乏沟通',
      lawsuit: '官司入狱之象，牢狱之灾，需高度警惕',
      health: '肾水泄木，肝肾两虚，病情危重需就医',
      travel: '出行不利，可能被困，签证问题',
      advice: '诸事不宜，守为上策，养精蓄锐待转机'
    }
  },
  { 
    sky: '甲', earth: '癸', 
    name: '青龙华盖', 
    // summary: '为利而合，吉凶看门，事有纠缠', 
    summary: '首尾无应，事有分歧，因甲为青龙，癸为天网，又为华盖，故为青龙华盖，又戊癸相合，故逢吉门为吉，可招福临门。门宫生比则诸事大吉，若门克宫则成中有败。本格适合占测婚姻感情与合作交易。逢凶门者事多不利，为凶。',
    nature: 'neutral',
    details: {
      origin: '癸水生甲木，但癸为阴水，如华盖遮龙，主隐秘',
      career: '事业有贵人暗助，但过程曲折，需耐心',
      wealth: '财运有暗财，但来路不明，需谨慎',
      marriage: '感情复杂，可能有第三者，关系不清',
      lawsuit: '官司有内情，幕后有人操作，真相难明',
      health: '肾气不足，注意泌尿系统，暗疾需查',
      travel: '出行宜低调，不宜张扬，保持隐秘',
      advice: '事情复杂纠缠，需抽丝剥茧，看门定吉凶'
    }
  },
  // 天盘乙
  { 
    sky: '乙', earth: '甲', name: '日月并行', 
    // summary: '阴阳得位，公私皆吉，谋为顺利', 
    summary: '月出沧海，龙凤呈祥。有利合作，合谋，有利文化事来，公谋私皆为吉。',
    nature: 'auspicious',
    details: {
      origin: '乙甲阴阳相配，如日月同辉，主诸事和谐',
      career: '事业顺遂，领导赏识，同事和睦，升迁有望',
      wealth: '财运亨通，正财偏财皆旺，投资获利',
      marriage: '姻缘美满，阴阳调和，家庭幸福',
      lawsuit: '诉讼得理，双方和解，皆大欢喜',
      health: '身体康健，阴阳平衡，精力充沛',
      travel: '出行大吉，顺风顺水，心想事成',
      advice: '把握良机，大胆行动，公私兼顾，全面发展'
    }
  },
  { 
    sky: '乙', earth: '乙', name: '日奇伏吟', 
    // summary: '宜静守，不宜见官谒贵、求名，百事皆阻', 
    summary: '奇中伏奇。乙乙比肩，不宜见上层领导、贵人，不宜求名求利，只宜安分守己为吉。',
    nature: 'neutral',
    details: {
      origin: '乙木重叠，阴气太重，主事物停滞',
      career: '事业原地踏步，升迁无望，保持现状',
      wealth: '财运平淡，收入稳定但无增长',
      marriage: '感情缺乏激情，双方都较被动',
      lawsuit: '官司拖延，难有进展，耐心等待',
      health: '肝气郁结，情绪低落，需疏肝理气',
      travel: '不宜出行，在家休养为佳',
      advice: '安分守己，不求名利，修心养性，待时而动'
    }
  },
  { 
    sky: '乙', earth: '丙', name: '奇仪顺遂', 
    // summary: '官职升迁，学术进益，凶星到则主离别', 
    summary: '乙木生丙火，为奇仪顺遂，吉星迁官晋职，区星夫妻反目离别。为先明后暗之局，声势不久，门宫相生再乘旺相则诸事显扬。若休囚则暗昧阻隔。工作、官职有利，夫占其妻，则必有离隔。',
    nature: 'auspicious',
    details: {
      origin: '乙木生丙火，三奇相生，主顺遂通达',
      career: '仕途亨通，升迁在即，学术有成',
      wealth: '财运上升，技术变现，知识付费',
      marriage: '感情升温，浪漫温馨，利于表白',
      lawsuit: '诉讼得理，文书有力，胜算大',
      health: '身心舒畅，但防肝火上炎',
      travel: '出行顺利，学术交流，考察调研皆宜',
      advice: '顺势而为，把握机遇，但需防凶星冲克导致分离'
    }
  },
  { 
    sky: '乙', earth: '丁', name: '奇仪相佐', 
    // summary: '文书、官司、经商、婚姻皆吉，百事可为', 
    summary: '为奇仪相佐，最利文书、考试，百事可为。有迟中得速之妙。（因乙为曲折，丁为迅速，乙生助丁而丁旺）阴人扶助。门宫相生则大利为主，逢克制则妇人多灾。',
    nature: 'auspicious',
    details: {
      origin: '乙丁皆为奇星，阴阳相济，主诸事大吉',
      career: '事业全面开花，文职武职皆顺',
      wealth: '财运旺盛，经商大利，合作共赢',
      marriage: '姻缘天成，感情和谐，利于嫁娶',
      lawsuit: '官司大胜，证据确凿，对方服输',
      health: '身体康健，心情愉快，精神饱满',
      travel: '出行大吉，诸事顺遂，心想事成',
      advice: '百事可为之时，勇于开拓，全面发展'
    }
  },
  { 
    sky: '乙', earth: '戊', 
    // name: '利阴害阳', 
    // summary: '门吉尚可，门凶则破财伤人，不宜公开行事', 
    name: '奇入天门',
    summary: '万事皆旺，利见大人，结合门宫生克旺墓以分主客之用。乙木克戊土，为阴害阳门（因戊为阳为天门），利于阴人、阴事、不利阳人、阳事，门吉尚可谋为，门凶、门迫则破财伤人。',
    nature: 'inauspicious',
    details: {
      origin: '戊土克乙木，阴受阳害，主暗中受损',
      career: '事业不宜高调，容易被人嫉妒攻击',
      wealth: '财运暗损，公开投资不利，私下求财',
      marriage: '感情宜低调，不宜公开秀恩爱',
      lawsuit: '官司不宜公开，私下调解为宜',
      health: '脾胃压制肝木，消化不良，情绪压抑',
      travel: '低调出行，不宜张扬目的地',
      advice: '暗中行事，低调做人，不可锋芒太露'
    }
  },
  { 
    sky: '乙', earth: '己', name: '日奇入墓', 
    // summary: '被土暗昧，门吉尚可，门凶则诸事不利、昏晦',
    summary: '有姑嫂相见之情。因戌为乙木之墓，故为日奇入墓，主暗昧阻碍，门凶事必凶，得开门为地遁，得日精之蔽诸事大利。', 
    nature: 'inauspicious',
    details: {
      origin: '乙木入己土之墓，如日落西山，主昏暗不明',
      career: '事业迷茫，方向不清，贵人隐退',
      wealth: '财运昏暗，投资看不清形势，易亏',
      marriage: '感情糊涂，对方心意不明，猜忌多',
      lawsuit: '官司不明朗，证据不清，真相被掩盖',
      health: '脾土困木，肝郁脾虚，精神萎靡',
      travel: '出行迷路，方向不明，易走弯路',
      advice: '等待光明，不可盲目行动，需借助外力照亮前路'
    }
  },
  { 
    sky: '乙', earth: '庚', 
    // name: '日奇被刑', 
    // summary: '争讼财产，夫妻怀私。女子被官司牵连', 
    name: '太白奇合', 
    summary: '有以柔制刚之意。主婚姻之喜。但须注意钱财是非，凡事半吉。庚金克刑乙木，故为日奇被刑，为争讼财产，夫妻怀有私意。', 
    nature: 'inauspicious',
    details: {
      origin: '庚金克乙木，如妻遇夫之刑克，主纷争',
      career: '工作中受打压，小人陷害，受处分',
      wealth: '财产纷争，合伙不欢而散，分家分产',
      marriage: '夫妻不和，各怀心思，离婚之象',
      lawsuit: '官司败诉，女性尤其不利，需请律师',
      health: '肝胆受损，情绪波动大，失眠焦虑',
      travel: '出行不利，尤其女性需注意安全',
      advice: '避免纷争，退让为上，保护自身利益为先'
    }
  },
  { 
    sky: '乙', earth: '辛', name: '青龙逃走', 
    // summary: '奴仆拐带，六畜皆伤，女弃其夫，男遇多变', 
    summary: '宫门若相生为吉，相克则为逃走，问婚则女避男。问出行则吉利。但易破财。乙为青龙，辛为白虎，乙木被辛金冲克而逃，故为青龙逃走，人亡财破，六畜皆伤。',
    nature: 'inauspicious',
    details: {
      origin: '辛金暗克乙木，如龙受伤逃遁，主背叛离散',
      career: '下属背叛，人才流失，团队分裂',
      wealth: '资产被卷走，员工拐带资源，损失惨重',
      marriage: '配偶变心，感情破裂，一方出轨',
      lawsuit: '官司中证人反水，同伙背叛',
      health: '气血不和，身体虚弱，免疫力下降',
      travel: '出行丢失物品，同伴失散',
      advice: '防人之心不可无，重要资产需保护，人事需谨慎'
    }
  },
  { 
    sky: '乙', earth: '壬', 
    // name: '日奇天罗', 
    // summary: '尊卑悖乱，官司是非，有人谋害，凡事不宁', 
    name: '奇神入狱', 
    summary: '主客均宜固守，主有悖乱之事，防官讼是非，但诸事不实。', 
    nature: 'inauspicious',
    details: {
      origin: '壬水虽生木，但为天罗，主受困',
      career: '上下级关系混乱，越级报告，秩序打乱',
      wealth: '财务混乱，账目不清，有人侵吞',
      marriage: '长幼无序，公婆矛盾，家庭不宁',
      lawsuit: '官司复杂，牵连多方，是非不断',
      health: '神经系统问题，失眠多梦，精神紧张',
      travel: '出行被困，签证问题，行程受阻',
      advice: '理顺关系，正本清源，防小人谋害'
    }
  },
  { 
    sky: '乙', earth: '癸', 
    // name: '日奇地网', 
    // summary: '遁迹隐形，躲灾避难为佳，退吉进凶', 
    name: '奇临华盖', 
    summary: '宜遁迹修道，退休诸事，避灾则吉。主背明就暗，凡事阻闭之象。若门宫相生，彼此尚吉，克制及临墓绝之地，诸事艰难，且先耗财而后如意。', 
    nature: 'neutral',
    details: {
      origin: '癸水为地网，乙木被网住，主隐藏',
      career: '事业宜收敛，高调必招祸，韬光养晦',
      wealth: '财运宜守，不宜扩张，保住本金',
      marriage: '感情宜低调，不宜公开，秘密恋情',
      lawsuit: '官司宜躲，能避则避，不要应战',
      health: '肾气不足，需要休养，不宜劳累',
      travel: '宜隐居避世，不宜出远门',
      advice: '退为上策，躲避灾祸，待时机成熟再现身'
    }
  },
  // 天盘丙
  { 
    sky: '丙', earth: '甲', name: '飞鸟跌穴', 
    // summary: '谋为洞彻，求财大利，不劳而获', 
    summary: '主客皆利，为奇门两大吉格之一，筹划设计，百事可为。甲为丙火之母，丙火回到母亲身边，好似飞鸟归巢，故名飞鸟跌穴，百事吉，事业可为，可谋大事。',
    nature: 'auspicious',
    details: {
      origin: '丙火得甲木生助，如飞鸟归巢，主得其所',
      career: '事业如有神助，机遇从天而降，贵人相助',
      wealth: '财运极佳，意外之财，投资大赚',
      marriage: '姻缘天成，一见钟情，缘分注定',
      lawsuit: '官司大胜，形势明朗，一目了然',
      health: '身体康健，精力旺盛，心情愉快',
      travel: '出行顺利，目的地正合心意',
      advice: '天赐良机，把握机遇，主动出击必有所得'
    }
  },
  { 
    sky: '丙', earth: '乙', name: '日月并行', 
    // summary: '阴阳得位，公私皆吉，谋为顺利', 
    summary: '月出沧海，龙凤呈祥。有利合作，合谋，有利文化事来，公谋私皆为吉。',
    nature: 'auspicious',
    details: {
      origin: '乙木生丙火，阴阳相济，主和谐圆满',
      career: '事业顺遂，同事支持，领导认可',
      wealth: '财运稳健，收支平衡，稳中有升',
      marriage: '感情甜蜜，互相扶持，家庭和睦',
      lawsuit: '诉讼和解，双方满意，圆满收场',
      health: '阴阳调和，身心健康',
      travel: '出行愉快，心情舒畅',
      advice: '保持平和心态，公私兼顾，稳步前进'
    }
  },
  { 
    sky: '丙', earth: '丙', name: '月奇悖师', 
    // summary: '文书逼迫，破耗遗失，为客不利', 
    summary: '为月奇悖师，文书逼迫，破耗遗失。主单据票证不明遗失。',
    nature: 'inauspicious',
    details: {
      origin: '两丙相见，火气太旺，主暴躁冲动',
      career: '工作压力大，文件催逼，deadline紧迫，注意乱臣贼子',
      wealth: '财运耗散，冲动消费，破财频繁',
      marriage: '感情火爆，争吵不断，互不相让',
      lawsuit: '官司焦灼，双方僵持，消耗巨大',
      health: '心火旺盛，血压升高，失眠烦躁，要注意眼睛',
      travel: '出行匆忙，遗失物品，心神不宁',
      advice: '冷静处事，控制情绪，不可冲动行事'
    }
  },
  { 
    sky: '丙', earth: '丁', 
    // name: '月奇得使', 
    // summary: '星随月转，贵人提拔，常人平和', 
    name: '星奇朱雀',
    summary: '贵人文书吉利，常人平静安乐，得三吉门为天遁。星月生辉，有光亮，美艳之象。有利贵人文书，学业，工作。不利婚姻。',
    nature: 'auspicious',
    details: {
      origin: '丙丁皆火，但阴阳相济，主得助力',
      career: '贵人提拔，升迁有望，才华得展',
      wealth: '财运上升，有人引荐好项目',
      marriage: '感情有媒人牵线，缘分天成',
      lawsuit: '官司有贵人帮忙，形势好转',
      health: '心情愉快，精神饱满',
      travel: '出行有人照应，顺利安全',
      advice: '借助贵人之力，把握机遇，感恩回报'
    }
  },
  { 
    sky: '丙', earth: '戊', name: '飞鸟跌穴', 
    // summary: '谋为洞彻，求财大利，不劳而获', 
    summary: '主客皆利，为奇门两大吉格之一，筹划设计，百事可为。甲为丙火之母，丙火回到母亲身边，好似飞鸟归巢，故名飞鸟跌穴，百事吉，事业可为，可谋大事。',
    nature: 'auspicious',
    details: {
      origin: '丙火生戊土，火土相生，主落到实处',
      career: '事业落地，项目落实，成果显著',
      wealth: '财运极佳，投资见效，收益丰厚',
      marriage: '感情稳定，有实质性进展，利于订婚',
      lawsuit: '官司胜诉，判决落实，执行到位',
      health: '身体踏实，脾胃和顺',
      travel: '出行到达目的地，心想事成',
      advice: '脚踏实地，把握机会，将想法付诸实践'
    }
  },
  { 
    sky: '丙', earth: '己', 
    // name: '火悖入刑', 
    // summary: '囚人刑杖，文书不行，吉凶看门', 
    name: '奇入明堂', 
    summary: '有乔迁之喜，文书不利，阻力刑囚，凶多吉少。又为隐明就暗之象，凡事迟滞，恩中招怨。吉门得吉，凶门转区。', 
    nature: 'inauspicious',
    details: {
      origin: '丙火受己土晦气，光明被遮，主受困',
      career: '工作受阻，文件卡住，审批不过',
      wealth: '资金周转困难，账款难收',
      marriage: '感情受困，双方家庭阻挠',
      lawsuit: '官司入狱之象，文书不利，需小心',
      health: '心脾不和，情绪低落，精神萎靡',
      travel: '出行受阻，证件问题，签证卡住',
      advice: '等待时机，不可强行突破，吉门可缓解'
    }
  },
  { 
    sky: '丙', earth: '庚', name: '荧入太白', 
    // summary: '门户破财，盗贼窃私，贼人自去', 
    summary: '遭盗遗失，门户破败，家事煎熬，防止外来是非。',
    nature: 'inauspicious',
    details: {
      origin: '丙火克庚金，火金相战，主争斗损耗',
      career: '工作中遇到强劲对手，竞争激烈',
      wealth: '财运受损，遭遇盗窃，财物丢失',
      marriage: '感情遭人破坏，第三者介入',
      lawsuit: '官司有输有赢，消耗巨大',
      health: '心肺不和，呼吸系统问题，注意感冒',
      travel: '出行防盗，贵重物品需保管好',
      advice: '加强防范，保护财产，对手终会自己离去'
    }
  },
  { 
    sky: '丙', earth: '辛', 
    // name: '月奇相合', 
    // summary: '谋事成就，病人不凶，化凶为吉', 
    name: '奇神生合',
    summary: '恩威并济，礼仪相交，门宫相生，则事情成就，在坎宫则凡事必成，逢克制则调和失败。病人渐好，谋为事成，文状入官。',
    nature: 'auspicious',
    details: {
      origin: '丙辛相合化水，主和谐转化',
      career: '事业有转机，对立面化为合作方',
      wealth: '财运好转，困难化解，收益增加',
      marriage: '感情和解，冲突化解，重归于好',
      lawsuit: '官司和解，化干戈为玉帛',
      health: '病情好转，化险为夷，逐渐康复',
      travel: '出行顺利，逢凶化吉',
      advice: '以和为贵，化解矛盾，转危为安'
    }
  },
  { 
    sky: '丙', earth: '壬',
    // name: '火入天网', 
    // summary: '为客不利，是非颇多，反复不宁', 
    name: '奇神游海',
    summary: '又名火入天网，惟利求官，凡事防不实，为客不利，防轻浮女子，一般人多动荡流离，贵人失名。壬水冲克丙火，故为客不利，是非颇多。',
    nature: 'inauspicious',
    details: {
      origin: '壬水克丙火，水火相战，主矛盾激烈',
      career: '工作是非多，人际关系紧张，小人多',
      wealth: '财运反复，今日赚明日赔，不稳定',
      marriage: '感情是非多，口舌争执不断',
      lawsuit: '官司反复，证据被推翻，情况多变',
      health: '心肾不交，失眠多梦，情绪波动',
      travel: '出行多阻，行程变化多端',
      advice: '稳住心态，不要被是非干扰，静待明朗'
    }
  },
  { 
    sky: '丙', earth: '癸', 
    name: '月奇地网', 
    // summary: '阴人害事，灾祸颇多，前途不明', 
    summary: '诸事得吉门生宫，则名利有成。逢克制则小人当权，灾祸连连，阴人害事，灾祸频生。',
    nature: 'inauspicious',
    details: {
      origin: '癸水克丙火，阴克阳，主暗害',
      career: '事业受小人暗算，背后有人使坏',
      wealth: '财运暗损，不明不白损失钱财',
      marriage: '感情有第三者暗中破坏，多为女性',
      lawsuit: '官司有人暗中操作，证据被毁',
      health: '暗疾难查，肾脏问题，需全面体检',
      travel: '出行遇险，不明危险，需格外小心',
      advice: '防小人暗害，保护自己，不要轻信他人'
    }
  },
  // 天盘丁
  { 
    sky: '丁', earth: '甲', name: '青龙转光', 
    // summary: '官人升迁，常人威昌，谋望大吉', 
    summary: '测命遇之大贵，凡事皆吉。又名青龙得光，问官升迁，常人威昌，凶恶不起，须查门宫生克衰旺以分主客。',
    nature: 'auspicious',
    details: {
      origin: '甲木生丁火，如青龙转动光芒，主显达',
      career: '仕途亨通，升迁在即，权力增加',
      wealth: '财运旺盛，事业带财，收入倍增',
      marriage: '感情光彩照人，配偶有助力',
      lawsuit: '官司大胜，正义得彰',
      health: '精神焕发，容光焕发，身心俱佳',
      travel: '出行光鲜，倍有面子',
      advice: '把握机遇，展现才华，光芒万丈'
    }
  },
  { 
    sky: '丁', earth: '乙', 
    // name: '玉女生奇', 
    // summary: '贵人升迁，婚姻财喜，文书吉', 
    name: '玉女奇生格', 
    summary: '逢太阴，生门，为人遁吉格，贵人加官晋爵，常人婚姻财帛有喜。', 
    nature: 'auspicious',
    details: {
      origin: '乙木生丁火，阴柔相生，主文雅富贵',
      career: '事业文雅，文职顺利，才华得展',
      wealth: '财运优雅，文财大旺，技术变现',
      marriage: '姻缘美满，遇到气质佳的对象',
      lawsuit: '文书顺利，诉讼得理，合同有利',
      health: '心情愉悦，面色红润',
      travel: '出行优雅，品质之旅',
      advice: '发挥文才，以柔克刚，优雅取胜'
    }
  },
  { 
    sky: '丁', earth: '丙', 
    // name: '星随月转', 
    // summary: '贵人高升，常人主悲，变动不安', 
    name: '奇神合明', 
    summary: '星随月转，利于跟随贵人办事，大有作为贵人越级，主客皆利。贵人越级高升，常人乐极生悲，要忍，不然因小的不忍而引起大的不幸。', 
    nature: 'neutral',
    details: {
      origin: '丁丙同为火，但丁为阴火随丙而动，主变化',
      career: '跟随领导升迁，但也可能被调走',
      wealth: '财运随大势变动，有涨有跌',
      marriage: '感情多变，追随对方变化',
      lawsuit: '官司形势变化，需跟进',
      health: '情绪波动大，心火不稳',
      travel: '行程多变，随时调整',
      advice: '顺势而为，不可固执己见，灵活应变'
    }
  },
  { 
    sky: '丁', earth: '丁', 
    // name: '星奇伏吟', 
    // summary: '文书即至，喜事遂心，万事如意', 
    name: '奇神相投',
    summary: '又名奇合重阴，主文书证件即至。诸事可谋，喜事从心，万事如意。凡事虽吉，惟恐相争。用兵宜先举，利于为客。',
    nature: 'auspicious',
    details: {
      origin: '丁火重叠，文昌星聚，主文书喜事',
      career: '文件到手，合同签订，事业有成',
      wealth: '财运稳定，合同带财，收入稳健',
      marriage: '喜事将至，订婚结婚皆宜',
      lawsuit: '诉讼文书有利，判决书下达',
      health: '心情愉快，万事如意',
      travel: '出行顺利，心想事成',
      advice: '喜事临门，准备迎接，万事如意'
    }
  },
  { 
    sky: '丁', earth: '戊', name: '青龙转光', 
    // summary: '官人升迁，常人威昌，谋望大吉', 
    summary: '测命遇之大贵，凡事皆吉。又名青龙得光，问官升迁，常人威昌，凶恶不起，须查门宫生克衰旺以分主客。',
    nature: 'auspicious',
    details: {
      origin: '丁火生戊土，光芒落实，主事业有成',
      career: '事业稳固，升迁落实，地位提升',
      wealth: '财运落地，收益实现，资产增值',
      marriage: '感情稳定，有实质性进展',
      lawsuit: '官司胜诉，判决执行',
      health: '身体健康，精神饱满',
      travel: '出行顺利，达成目的',
      advice: '将光芒转化为实际成果，脚踏实地'
    }
  },
  { 
    sky: '丁', earth: '己', 
    // name: '火入勾陈', 
    // summary: '奸私仇冤，事因女人，谋为不利', 
    name: '玉女施恩', 
    summary: '主有阴私之事，凡事情投意合，须看丁已所临宫门生旺迫制以定主客之动静。因戌为火库，己为勾陈，故为火入勾陈，奸私仇冤，事因女人。', 
    nature: 'inauspicious',
    details: {
      origin: '己土晦丁火，如入勾陈之地，主阴私',
      career: '工作中有人暗算，女性关系复杂',
      wealth: '财运因女人而损，感情用事亏钱',
      marriage: '感情复杂，多角关系，仇怨纠缠',
      lawsuit: '官司因女人而起，旧怨新仇',
      health: '心脾不和，情绪压抑，女性疾病',
      travel: '出行因女性而阻，需注意',
      advice: '远离是非，清理复杂关系，不可贪图美色'
    }
  },
  { 
    sky: '丁', earth: '庚', 
    // name: '星奇受阻', 
    // summary: '文书阻隔，消息不通，行人必归', 
    name: '悖格', 
    summary: '文书阻隔，凡事难以强图，其事反复不常。若庚临生旺必主大战。详宫门衰旺，分主客之胜负。丁为文书，庚为阻隔之神，故为文书阻隔，行人必归。', 
    nature: 'inauspicious',
    details: {
      origin: '庚金克制丁火，光芒被遮，主阻滞',
      career: '工作文件被卡，审批不过，晋升受阻',
      wealth: '财运受阻，合同谈不拢，资金不到位',
      marriage: '感情受阻，双方家庭反对',
      lawsuit: '诉讼文书被驳回，上诉困难',
      health: '心肺不和，气滞血瘀',
      travel: '出行受阻，行人返回，不宜远行',
      advice: '耐心等待，寻找突破口，不可硬冲'
    }
  },
  { 
    sky: '丁', earth: '辛', name: '朱雀入狱', 
    summary: '罪人释囚，官人失位，牢狱之灾', 
    nature: 'inauspicious',
    details: {
      origin: '丁火克辛金，但丁也受制，如朱雀入笼',
      career: '领导失位，权力被夺，职位不保',
      wealth: '财务问题暴露，资金被冻结',
      marriage: '感情入困局，双方都不自由',
      lawsuit: '牢狱之灾，但罪人有望释放',
      health: '心肺问题，情绪压抑，需要释放',
      travel: '出行被困，行动不自由',
      advice: '谨言慎行，避免法律风险，寻求解脱'
    }
  },
  { 
    sky: '丁', earth: '壬', name: '奇仪相合', 
    // summary: '凡事能成，贵人辅助，测婚多苟合', 
    summary: '百事有成，贵人辅助。又名玉女乘龙游海，加直符则为得使，主贵人和合。此格常与私情有关。此格于震巽二宫尤利。',
    nature: 'auspicious',
    details: {
      origin: '丁壬相合化木，水火既济，主成事',
      career: '事业有成，贵人相助，水到渠成',
      wealth: '财运亨通，合作获利，资源整合',
      marriage: '姻缘和合，但需注意关系正当性',
      lawsuit: '官司和解，双方妥协，圆满结局',
      health: '心肾相交，身体调和',
      travel: '出行顺利，合作愉快',
      advice: '借助合作之力，但需注意关系的正当性'
    }
  },
  { 
    sky: '丁', earth: '癸', name: '朱雀投江', 
    // summary: '文书口舌，音信沉溺，官司词讼', 
    summary: '癸水冲克丁火，为朱雀投江，文书口舌是非，经官动储，词讼不利，音信沉溺不到。文书音信有丢失，谋为不利，如癸为直符则丁奇得使用，丁主动，癸主静，其势搏激，生死关头，详丁癸之生墓，知主客之雌雄。',
    nature: 'inauspicious',
    details: {
      origin: '癸水克丁火，如朱雀落水，主沉溺',
      career: '工作文书问题多，口舌是非不断',
      wealth: '财运被淹，资金链断裂，投资打水漂',
      marriage: '感情冷淡，沟通不畅，消息不通',
      lawsuit: '官司纠缠，口舌争执，难有结果',
      health: '心肾不交，情绪低落，精神萎靡',
      travel: '出行遇水险，需注意安全',
      advice: '谨言慎行，保存实力，避免口舌之争'
    }
  },
  // 天盘戊（与甲类似，因甲遁戊下）
  { 
    sky: '戊', earth: '甲', name: '青龙返首', 
    // summary: '大吉大利，若逢击刑则吉事成凶', 
    summary: '因青龙甲木生助丙火，故为青龙返首，如宫门无克，则大吉大利。如宫门相克，则诸事费力才成。又主土木动作，宅室光辉，父子大利。门克宫则利客，宫克门则利主，但本局虽吉利，却忌讳遇到六仪击刑，门迫以及奇仪入墓。若逢迫墓击刑，吉事成凶。',
    nature: 'auspicious',
    details: {
      origin: '戊甲同宫，甲遁戊下，贵人回首顾盼',
      career: '事业腾飞，贵人眷顾，机遇来临',
      wealth: '财运极佳，贵人带财，投资大利',
      marriage: '姻缘美满，贵人牵线，感情升温',
      lawsuit: '官司大胜，贵人相助，逢凶化吉',
      health: '身体康健，精力充沛，正气护体',
      travel: '出行大吉，贵人护佑，顺风顺水',
      advice: '把握良机，贵人相助之时大胆行动'
    }
  },
  { 
    sky: '戊', earth: '乙', 
    name: '青龙合会', 
    // summary: '贵人助，合主病多，吉凶看门', 
    summary: '甲己会合，因甲乙均位于东方青龙之位，所以又叫青龙和会，会得到同事，朋友的帮助，凡事主客均利，有利于谒贵，面试，门吉事也吉，门凶事也区。',
    nature: 'auspicious',
    details: {
      origin: '戊土与乙木相合，主合作顺利',
      career: '事业有合作机会，团队协作良好',
      wealth: '财运通过合作获得，共赢局面',
      marriage: '感情和谐，双方配合默契',
      lawsuit: '诉讼可调解，和解为上',
      health: '合主病多，注意脾胃肝胆',
      travel: '结伴出行为佳，互相照应',
      advice: '把握合作机会，但需注意身体健康'
    }
  },
  { 
    sky: '戊', earth: '丙', name: '青龙返首', 
    // summary: '大吉大利，若逢击刑则吉事成凶', 
    summary: '因青龙甲木生助丙火，故为青龙返首，如宫门无克，则大吉大利。如宫门相克，则诸事费力才成。又主土木动作，宅室光辉，父子大利。门克宫则利客，宫克门则利主，但本局虽吉利，却忌讳遇到六仪击刑，门迫以及奇仪入墓。若逢迫墓击刑，吉事成凶。',
    nature: 'auspicious',
    details: {
      origin: '丙火生戊土，能量充沛，主兴旺',
      career: '事业兴旺，能量充沛，干劲十足',
      wealth: '财运旺盛，投资有回报，收益丰厚',
      marriage: '感情热烈，激情四射，甜蜜幸福',
      lawsuit: '官司胜诉，形势明朗，一目了然',
      health: '精力充沛，但防火气太旺',
      travel: '出行顺利，心情愉快',
      advice: '借助热情和能量，大胆进取，但需控制火气'
    }
  },
  { 
    sky: '戊', earth: '丁', name: '青龙耀明', 
    summary: '谒贵求名吉，击刑则减吉', 
    nature: 'auspicious',
    details: {
      origin: '丁火生戊土，文明之光，主显达',
      career: '利于考试求名，文职升迁，学术有成',
      wealth: '文财旺盛，技术变现，知识付费',
      marriage: '感情文雅，书香之恋，品味高雅',
      lawsuit: '诉讼文书有力，证据确凿',
      health: '心脾和谐，精神愉快',
      travel: '文化之旅，学术交流皆宜',
      advice: '发挥文采，求名求学皆可，光芒耀眼'
    }
  },
  { 
    sky: '戊', earth: '戊', 
    // name: '青龙伏吟', 
    // summary: '凡事闭塞，静守为吉，不宜动作', 
    name: '青龙入地',
    summary: '甲比肩，名谓伏吟。回环辗转，进退未决，占信，则喜信必来。门合则美，门塞星凶，空有财至。适合养精蓄锐，等待机遇，其意义相当于潜龙勿用。遇此，凡事不利，道路闭塞，以守为好。',
    nature: 'neutral',
    details: {
      origin: '戊土重叠，如重土压顶，主停滞',
      career: '事业停滞，进展缓慢，需耐心等待',
      wealth: '财运平淡，守成为主，不宜投资',
      marriage: '感情原地踏步，缺乏新意',
      lawsuit: '官司拖延，短期难有结果',
      health: '脾胃负担重，消化不良',
      travel: '不宜出行，在家休息为佳',
      advice: '静待时机，不可强求，养精蓄锐'
    }
  },
  { 
    sky: '戊', earth: '己', 
    // name: '贵人入狱', 
    // summary: '公私不利，凡事受阻，需冲开方好', 
    name: '青龙相合', 
    summary: '主有财运，婚姻之喜，若门生宫及比合，则主百事吉，门克宫则好事成蹉跎，有始无终。此格不利求贵与面试，因为戌为戊土之墓，故为贵人入狱，公私皆不利。宜踏实稳步，齐心协力。', 
    nature: 'inauspicious',
    details: {
      origin: '戊己同为土，己土阴暗，主困顿',
      career: '事业受阻，小人当道，才华被埋',
      wealth: '财运受困，资金不畅，周转困难',
      marriage: '感情受困，双方都不自由',
      lawsuit: '官司陷入僵局，难有进展',
      health: '脾胃湿困，身体沉重',
      travel: '出行不利，易遇阻滞',
      advice: '寻找突破口，借助外力冲开困局'
    }
  },
  { 
    sky: '戊', earth: '庚', 
    // name: '值符飞宫', 
    // summary: '换地易迁，吉事不吉，凶事更凶', 
    name: '青龙失势',
    summary: '甲最怕庚金克杀，故为值符飞宫，吉事不吉，区事更凶，求财没利益，测病也主凶，防不测之灾，如入虎穴，如单身探敌宫。又为太白登天门格，如门制宫则凶，如见天辅星，则大利考试。同时，甲庚相冲，飞宫也主换地方。',
    nature: 'inauspicious',
    details: {
      origin: '戊土生庚金，能量外泄，主变动',
      career: '工作变动，可能调岗或换公司',
      wealth: '财运外泄，资金流失，投资亏损',
      marriage: '感情变动，分居异地',
      lawsuit: '官司管辖权变更，异地审理',
      health: '脾肺不和，免疫力下降',
      travel: '迁移搬家之象，居无定所',
      advice: '顺应变化，灵活调整，不可固执'
    }
  },
  { 
    sky: '戊', earth: '辛', name: '青龙折足', 
    // summary: '吉门尚可，凶门失财，防足疾', 
    summary: '因辛金克甲木，子午相冲，故为青龙折足，吉门有生肋，尚能谋事，若逢凶门，主招灾、失财或有足疾、折伤。',
    nature: 'inauspicious',
    details: {
      origin: '戊土生辛金，但能量不足，主受损',
      career: '事业受挫，但可克服，需坚持',
      wealth: '财运小损，投资需谨慎',
      marriage: '感情有波折，需要耐心沟通',
      lawsuit: '官司有小失，但可挽回',
      health: '四肢筋骨问题，注意足疾',
      travel: '出行注意安全，防跌倒扭伤',
      advice: '吉门可行，凶门止步，稳中求进'
    }
  },
  { 
    sky: '戊', earth: '壬', 
    // name: '青龙天牢', 
    // summary: '诸事不利，投资亏本，测病主凶', 
    name: '青龙入狱', 
    summary: '因壬为天牢，甲为青龙，故为青龙入天牢，凡阴阳事皆不吉利。一切事体不利，被客观环境和条件所限制。门克宫则利客，宫克门并且壬值得令之时，则利主，此格多主耗散。', 
    nature: 'inauspicious',
    details: {
      origin: '壬水克戊土，如被困天牢，主受制',
      career: '事业困顿，项目搁浅，发展受限',
      wealth: '投资大亏，资金被套，经济困难',
      marriage: '感情冷淡，沟通不畅',
      lawsuit: '官司入狱之象，需高度警惕',
      health: '肾水克土，脾肾两虚，病情严重',
      travel: '出行被困，行动受限',
      advice: '诸事不宜，守为上策，静待转机'
    }
  },
  { 
    sky: '戊', earth: '癸', name: '青龙华盖', 
    // summary: '为利而合，吉凶看门，事有纠缠', 
    summary: '首尾无应，事有分歧，因甲为青龙，癸为天网，又为华盖，故为青龙华盖，又戊癸相合，故逢吉门为吉，可招福临门。门宫生比则诸事大吉，若门克宫则成中有败。本格适合占测婚姻感情与合作交易。逢凶门者事多不利，为凶。',
    nature: 'neutral',
    details: {
      origin: '戊癸相合，但癸为阴水，主隐秘',
      career: '事业有贵人暗助，但过程曲折',
      wealth: '财运有暗财，来路需查明',
      marriage: '感情复杂，关系不清不楚',
      lawsuit: '官司有内情，真相难明',
      health: '肾气不足，暗疾需查',
      travel: '出行宜低调，不宜张扬',
      advice: '理清关系，抽丝剥茧，看门定吉凶'
    }
  },
  // 天盘己
  { 
    sky: '己', earth: '甲', 
    name: '犬遇青龙', 
    // summary: '门吉大吉，门凶徒劳，谋为可行', 
    summary: '万事得吉祥，谋为皆遂意，又名明堂从禄格，若临生旺之宫，主客均利。因戌为犬，门吉为谋望遂意，上人见喜；若门凶，枉费心机。',
    nature: 'neutral',
    details: {
      origin: '甲己相合，但己为阴土暗昧，吉凶参半',
      career: '事业可行，但需看具体环境和条件',
      wealth: '财运取决于门的吉凶，吉门获利',
      marriage: '姻缘有望，但需看双方条件',
      lawsuit: '官司可行，但结果取决于门',
      health: '脾胃功能需注意调理',
      travel: '出行可行，吉门顺利',
      advice: '审时度势，看准门的吉凶再行动'
    }
  },
  { 
    sky: '己', earth: '乙', 
    // name: '地户逢星', 
    // summary: '墓神不明，遁迹隐形，前途渺茫', 
    name: '日入地户', 
    summary: '凡事暗昧难图，有蒙蔽侵犯之意。结合已乙所临宫门之生旺墓迫，分主客而论之。因戌为乙木之墓，己又为地户，故墓神不明，地户逢星，宜遁迹隐形为利。', 
    nature: 'inauspicious',
    details: {
      origin: '己土克乙木，木入土墓，主昏暗',
      career: '事业方向不明，前途渺茫',
      wealth: '财运暗淡，看不清形势',
      marriage: '感情糊涂，双方心意不明',
      lawsuit: '官司不明朗，证据不清',
      health: '脾土困木，肝郁脾虚',
      travel: '出行迷失方向，不知去向',
      advice: '等待光明，不可盲目行动，寻求指引'
    }
  },
  { 
    sky: '己', earth: '丙', name: '火悖地户', 
    // summary: '男遭冤害，女遭淫污，感情易变', 
    summary: '男子占之有人相害，女子有感情是非，恩中成怨，凡事屈抑难伸，先暗后明，利于为客。如已为值符则按青龙回首格论。',
    nature: 'inauspicious',
    details: {
      origin: '丙火生己土但受晦，主感情问题',
      career: '工作中受冤枉，有口难辩',
      wealth: '财运因感情而损失',
      marriage: '感情遭破坏，一方可能出轨',
      lawsuit: '官司中被冤枉，难以申辩',
      health: '心脾不和，情绪失控',
      travel: '出行遇险，尤其感情纠纷',
      advice: '保护自己，远离是非场所，谨慎交友'
    }
  },
  { 
    sky: '己', earth: '丁', 
    name: '朱雀入墓', 
    // summary: '文书词讼先曲后直，终必有理', 
    summary: '凡事虽吉，然先费后益，利为客。文状词讼先曲而后直。因戌为火墓，故名为朱雀入墓。',
    nature: 'neutral',
    details: {
      origin: '丁火生己土入墓，光明暂被遮蔽',
      career: '工作先难后易，坚持终有回报',
      wealth: '财运先困后通，耐心等待',
      marriage: '感情先苦后甜，磨合后更稳定',
      lawsuit: '官司先败后胜，真相终会大白',
      health: '病情先重后轻，积极治疗可愈',
      travel: '出行先阻后通，坚持可达',
      advice: '不要灰心，坚持就是胜利，终会云开雾散'
    }
  },
  { 
    sky: '己', earth: '戊', name: '犬遇青龙', 
    // summary: '门吉大吉，门凶徒劳，谋为可行', 
    summary: '万事得吉祥，谋为皆遂意，又名明堂从禄格，若临生旺之宫，主客均利。因戌为犬，门吉为谋望遂意，上人见喜；若门凶，枉费心机。',
    nature: 'neutral',
    details: {
      origin: '戊己同属土，主稳定但缺乏变化',
      career: '事业稳定，但突破困难',
      wealth: '财运平稳，大起大落不多',
      marriage: '感情稳定，但缺乏激情',
      lawsuit: '官司僵持，需找突破口',
      health: '脾胃功能需调理',
      travel: '出行一般，无大碍',
      advice: '看门定吉凶，吉门可行，凶门勿动'
    }
  },
  { 
    sky: '己', earth: '己', 
    name: '地户逢鬼', 
    // summary: '百事不遂，病者危险，不可谋为', 
    summary: '病者发凶或必死，百事不遂，暂不谋为，谋为则凶。自屈难伸，进退不决，宜固守，旧事物。',
    nature: 'inauspicious',
    details: {
      origin: '己土重叠，阴气太重，如入鬼门',
      career: '事业诸事不顺，处处碰壁',
      wealth: '财运极差，投资必亏',
      marriage: '感情阴暗，双方都有问题',
      lawsuit: '官司必败，不宜应诉',
      health: '病情危险，需立即就医',
      travel: '不宜出行，在家静养',
      advice: '万事不可为，静待时机，保护好自己'
    }
  },
  { 
    sky: '己', earth: '庚', name: '刑格反名', 
    // summary: '谋为徒劳，先动不利，谨防谋害', 
    summary: '词讼先动者不利，如临阴星则有谋害之情。男子占之宜静，女子占之主私情。',
    nature: 'inauspicious',
    details: {
      origin: '己土生庚金，但格局不正，主反复',
      career: '工作徒劳无功，越努力越失败',
      wealth: '投资反复，先赚后赔',
      marriage: '感情反复，分分合合',
      lawsuit: '官司反复，证据被推翻',
      health: '病情反复，时好时坏',
      travel: '出行徒劳，目的难达',
      advice: '不可先动，后发制人，防被人算计'
    }
  },
  { 
    sky: '己', earth: '辛', 
    name: '游魂入墓', 
    // summary: '人鬼相侵，鬼魅作祟，凡事谨慎', 
    summary: '易遭阴人作崇。占风水逢之家有阴人做怪，小口有欠。',
    nature: 'inauspicious',
    details: {
      origin: '己土生辛金入墓，阴气太重，主邪祟',
      career: '工作中小人作祟，暗箭难防',
      wealth: '财运被暗中破坏，不明损失',
      marriage: '感情有第三者暗中破坏',
      lawsuit: '官司有人暗中操作',
      health: '精神问题，失眠多梦，噩梦连连',
      travel: '出行遇险，邪气侵身',
      advice: '正心正念，远离阴暗场所，保持正气'
    }
  },
  { 
    sky: '己', earth: '壬', name: '地网高张', 
    // summary: '奸情伤杀，事多变动，小人当道', 
    summary: '女子奸恶，男子遭伤，门迫星凶，两人俱亡，百事无成。',
    nature: 'inauspicious',
    details: {
      origin: '壬水被己土所制，如网中之鱼，主被困',
      career: '工作中被小人陷害，处处受制',
      wealth: '财运被人算计，资产被侵吞',
      marriage: '感情复杂，涉及第三者',
      lawsuit: '官司被人操控，难以翻身',
      health: '肾脾不和，水土不服',
      travel: '出行被困，身不由己',
      advice: '识破小人，保护自己，寻求高人指点'
    }
  },
  { 
    sky: '己', earth: '癸', name: '地刑玄武', 
    // summary: '疾病垂危，囚狱词讼，事关私欲', 
    summary: '男女疾病垂危，病不能语，凡事反复难成，详门宫生克以定主客胜负。有囚狱词讼之灾。',
    nature: 'inauspicious',
    details: {
      origin: '己土克癸水，阴克阴，主阴暗私欲',
      career: '工作因私欲而失败，贪婪害己',
      wealth: '财运因贪心而损失',
      marriage: '感情因私欲而破裂',
      lawsuit: '官司因私欲而入狱',
      health: '病情危重，可能与肾脏相关',
      travel: '出行因私事而惹祸',
      advice: '克制私欲，正心诚意，戒贪戒色'
    }
  },
  // 天盘庚
  { 
    sky: '庚', earth: '甲', name: '天乙伏宫', 
    // summary: '破财伤人，不利合作，百事皆凶', 
    summary: '庚金克甲木，百事不可谋，大凶。先述后得，阳时利客，可求财利，余财百事难为。',
    nature: 'inauspicious',
    details: {
      origin: '庚金克甲木，如白虎伤青龙，主伤害',
      career: '事业遭遇重创，被对手打压',
      wealth: '财运大损，破财严重',
      marriage: '感情破裂，争吵不断',
      lawsuit: '官司大败，损失惨重',
      health: '肝胆受损，外伤风险高',
      travel: '出行危险，意外事故风险',
      advice: '能避则避，不可硬拼，保护好自己'
    }
  },
  { 
    sky: '庚', earth: '乙', name: '太白逢星', 
    // summary: '退吉进凶，夫妻不和，牵绊不顺', 
    summary: '退吉进凶，谋为不利。庚乙合化金，因此庚加乙在乾兑二宫尤吉。',
    nature: 'inauspicious',
    details: {
      origin: '庚金克乙木，主制约牵绊',
      career: '工作进展受阻，退一步海阔天空',
      wealth: '财运进取不利，守成为上',
      marriage: '夫妻不和，争执不断',
      lawsuit: '官司进取不利，调解为宜',
      health: '肝气郁结，情绪压抑',
      travel: '出行不宜，退回为佳',
      advice: '退为上策，不可强进，以退为进'
    }
  },
  { 
    sky: '庚', earth: '丙', name: '太白入荧', 
    // summary: '占贼必来，为客进利，为主破财', 
    summary: '如庚为直符，则为青龙回首。占贼必来，凡事费力，易破财。失亡被盗，难获难寻。为客进利，为主破财。',
    nature: 'neutral',
    details: {
      origin: '丙火克庚金，火金相战，主争斗',
      career: '工作中有竞争对手，需应对挑战',
      wealth: '财运看立场，做客有利，做主不利',
      marriage: '感情有竞争者，需积极应对',
      lawsuit: '官司有对手，势均力敌',
      health: '心肺不和，呼吸系统注意',
      travel: '出行有竞争，先到者得',
      advice: '看清形势，做客主动出击，做主严防死守'
    }
  },
  { 
    sky: '庚', earth: '丁', name: '亭亭之格', 
    summary: '金屋藏娇，门吉尚吉，私匿官司', 
    nature: 'neutral',
    details: {
      origin: '丁火克庚金但力弱，如金屋藏娇',
      career: '工作有隐秘安排，不可公开',
      wealth: '财运有暗财，私下交易',
      marriage: '感情有秘密，金屋藏娇之象',
      lawsuit: '官司有隐情，私下和解',
      health: '心肺调和，但有隐疾',
      travel: '出行有秘密目的，不宜公开',
      advice: '保持隐秘，吉门可行，不可张扬'
    }
  },
  { 
    sky: '庚', earth: '戊', name: '天乙伏宫', 
    // summary: '破财伤人，不利合作，百事皆凶', 
    summary: '庚金克甲木，百事不可谋，大凶。先述后得，阳时利客，可求财利，余财百事难为。',
    nature: 'inauspicious',
    details: {
      origin: '戊土生庚金，但格局不吉，主损耗',
      career: '事业消耗巨大，付出多回报少',
      wealth: '财运外泄，投资无回报',
      marriage: '感情付出多收获少',
      lawsuit: '官司消耗巨大，得不偿失',
      health: '脾肺消耗，免疫力下降',
      travel: '出行消耗大，收获小',
      advice: '减少消耗，保存实力，等待时机'
    }
  },
  { 
    sky: '庚', earth: '己', name: '官府刑格', 
    // summary: '私欲伤害，官讼判刑，主客不利', 
    summary : '主有官司口舌，因官讼被判刑，官司遭重，狱囚之人，难有伸理。',
    nature: 'inauspicious',
    details: {
      origin: '己土生庚金，但己土阴暗，主官非',
      career: '工作中涉及法律问题，需谨慎',
      wealth: '财务问题可能触法',
      marriage: '感情涉及法律纠纷',
      lawsuit: '官司判刑之象，极为不利',
      health: '脾肺不和，情绪压抑',
      travel: '出行涉及法律问题，不宜',
      advice: '遵纪守法，远离灰色地带，正当经营'
    }
  },
  { 
    sky: '庚', earth: '庚', name: '太白同宫', 
    // summary: '兄弟不和，官灾横祸，变动争财', 
    summary: '又名战格，官灾横祸，兄弟或同辈朋友相冲撞，不利为事。百日后方能消除。有自作愤激之情，为自刑之象',
    nature: 'inauspicious',
    details: {
      origin: '两庚相见，金气太重，主争斗',
      career: '工作中同事竞争激烈，内斗严重',
      wealth: '财运因竞争而损失',
      marriage: '感情有第三者介入',
      lawsuit: '官司激烈，双方都受损',
      health: '肺金太旺，燥气伤身',
      travel: '出行遇同行竞争',
      advice: '避免内斗，寻求共赢，否则两败俱伤'
    }
  },
  { 
    sky: '庚', earth: '辛', name: '白虎干格', 
    // summary: '远行不利，车折马死，诸事灾殃', 
    summary: '不宜远行，远行车折马伤，求财更为大凶。两强相持之象，主伤亡车祸，感情分手，有事难休。凡事必有争论，阳时利为客。',
    nature: 'inauspicious',
    details: {
      origin: '庚辛皆金，金气过重，主灾殃',
      career: '事业遭遇意外打击',
      wealth: '财运遭遇突发损失',
      marriage: '感情遭遇突变',
      lawsuit: '官司有意外情况',
      health: '肺金受损，呼吸系统问题，外伤风险',
      travel: '出行极不利，车祸意外风险高',
      advice: '尽量不要出行，如必须出行需格外小心'
    }
  },
  { 
    sky: '庚', earth: '壬', 
    // name: '移荡之格', 
    // summary: '远行迷失，音信皆阻，多主变动', 
    name: '小格', 
    summary: '壬水主流动，庚为阻隔之神，故远行道路迷失，男女音信难通。占信息道路不通。如再逢伤门主灾病，逢死门主丧事阻隔。', 
    nature: 'inauspicious',
    details: {
      origin: '庚金生壬水，能量外泄，主漂泊',
      career: '工作不稳定，频繁变动',
      wealth: '财运漂泊不定，难以积累',
      marriage: '感情不稳定，聚少离多',
      lawsuit: '官司管辖权变更，反复无常',
      health: '肺肾不和，精力流失',
      travel: '出行漂泊，迷失方向',
      advice: '寻找定点，稳定下来，不可继续漂泊'
    }
  },
  { 
    sky: '庚', earth: '癸', name: '大格', 
    // summary: '行人不至，生产皆伤，官司破财', 
    summary: '主信息远。人情悖逆，谋为多阻。因寅申相冲克，庚为道路，故多主车祸，行人不至，官事不止，大凶。防不测之事，阳时利为各。',
    nature: 'inauspicious',
    details: {
      origin: '庚金生癸水，但形成大格，主不通',
      career: '工作不顺，人才流失',
      wealth: '财运不通，资金不回',
      marriage: '感情不通，人不回来',
      lawsuit: '官司不利，破财严重',
      health: '气血不通，生产不利',
      travel: '出行不通，人不回来',
      advice: '耐心等待，疏通关系，不可强求'
    }
  },
  // 天盘辛
  { 
    sky: '辛', earth: '甲', name: '困龙被伤', 
    // summary: '屈抑守分，妄动祸殃，官司破财', 
    summary: '辛金克甲木，子午又相冲，故为困龙被伤，主官司破财，屈抑守分尚可，妄动则带来祸殃。凡事不和，求谋不利，龙困遭伤，因此易损钱财，伤四肢，男子逢之尤忌，射物为缺损物品。',
    nature: 'inauspicious',
    details: {
      origin: '辛金克甲木，如困龙受伤，主受制',
      career: '事业受压制，才华难施展',
      wealth: '财运受限，难有大发展',
      marriage: '感情受困，双方都不自由',
      lawsuit: '官司不利，被告方更不利',
      health: '肝胆受压，情绪压抑',
      travel: '出行受限，不能自由行动',
      advice: '安分守己，不可妄动，等待解脱'
    }
  },
  { 
    sky: '辛', earth: '乙', name: '白虎猖狂', 
    // summary: '家破人亡，远行多殃，男弃其妻', 
    summary: '辛金冲克乙木，故名为白虎猖狂，家败人亡，远行多灾殃测婚离散，主因男人。有走失破财之事，所谋难成。如辛乘旺气而乙木逢生则得财利。',
    nature: 'inauspicious',
    details: {
      origin: '辛金克乙木，如白虎发狂，主凶险',
      career: '事业遭遇重创，可能失业',
      wealth: '财运大损，家业破败',
      marriage: '婚姻危机，男方可能抛弃女方',
      lawsuit: '官司惨败，损失惨重',
      health: '肝胆受损严重，外伤风险极高',
      travel: '远行极不利，生命危险',
      advice: '远离危险，不可远行，保护家人'
    }
  },
  { 
    sky: '辛', earth: '丙', name: '干合悖师', 
    // summary: '合中有乱，因财致讼，吉凶看门', 
    summary: '门吉则事吉，门凶则事凶，测事易因财物致讼。辛为直符加丙则为青龙回首，有威权作合之象，主炉治之事，凡事吉昌。占雨无，占晴早，易因财而致讼。',
    nature: 'neutral',
    details: {
      origin: '丙辛相合但相冲，主表面和谐内里矛盾',
      career: '工作合作中有矛盾，表面和气',
      wealth: '财运有合作但有纠纷',
      marriage: '感情表面和谐内里有问题',
      lawsuit: '官司可能因财产而起',
      health: '心肺表面调和，暗有问题',
      travel: '出行有伴但有矛盾',
      advice: '看清本质，不被表面迷惑，门吉可行'
    }
  },
  { 
    sky: '辛', earth: '丁', name: '狱神得奇', 
    // summary: '经商倍利，囚人赦免，意外收获', 
    summary: '辛为狱神，丁为星奇，故名为狱神得奇。经商获倍利，囚人逢赦，但防受惊，又主凡事有始无终，内多耗散。如门生宫，宫克门大利主，如门克宫，丁逢衰墓则只宜固守。',
    nature: 'auspicious',
    details: {
      origin: '丁火克辛金，但丁为奇星，化凶为吉',
      career: '事业逢凶化吉，困境中有转机',
      wealth: '经商获利，意外之财',
      marriage: '感情有转机，和好如初',
      lawsuit: '官司有赦免，囚人释放',
      health: '病情好转，康复在望',
      travel: '出行有意外收获',
      advice: '困境中寻找机会，化险为夷'
    }
  },
  { 
    sky: '辛', earth: '戊', name: '困龙被伤', 
    // summary: '屈抑守分，妄动祸殃，官司破财', 
    summary: '辛金克甲木，子午又相冲，故为困龙被伤，主官司破财，屈抑守分尚可，妄动则带来祸殃。凡事不和，求谋不利，龙困遭伤，因此易损钱财，伤四肢，男子逢之尤忌，射物为缺损物品。',
    nature: 'inauspicious',
    details: {
      origin: '戊土生辛金，但辛金受困，主压抑',
      career: '事业虽有资源但难以施展',
      wealth: '财运有来源但难以变现',
      marriage: '感情虽稳定但缺乏活力',
      lawsuit: '官司有证据但难以使用',
      health: '脾胃尚可但精神压抑',
      travel: '出行有条件但受限制',
      advice: '保持耐心，积蓄力量，等待时机'
    }
  },
  { 
    sky: '辛', earth: '己', name: '入狱自刑', 
    // summary: '奴仆背主，狱讼难伸，自错破财', 
    summary: '辛为罪人，戌为午火之库，故名为入狱自刑，奴仆背主，有苦诉讼难伸。入狱自弄诉讼难伸，凡事主破财，暗里灾殃，凡事费力方成，利于为客。',
    nature: 'inauspicious',
    details: {
      origin: '己土生辛金入狱，主自作自受',
      career: '工作中下属背叛，自己也有错',
      wealth: '财运因自己失误而损失',
      marriage: '感情因自己问题而破裂',
      lawsuit: '官司中自己也有责任',
      health: '疾病因自己不当行为而起',
      travel: '出行因自己失误而出问题',
      advice: '反省自己，改正错误，不可怨天尤人'
    }
  },
  { 
    sky: '辛', earth: '庚', name: '白虎出力', 
    // summary: '刀光血影，主客相残，退避尚可', 
    summary: '刀刃相交，主客相残，逊让退步稍可，两女争男，皆因酒色，防凶祸。凡谋不利，凡事反复迟滞，忧惊。',
    nature: 'inauspicious',
    details: {
      origin: '庚辛皆金，金气太重，主杀伐',
      career: '工作中激烈冲突，刀光剑影',
      wealth: '财运因冲突而损失',
      marriage: '感情激烈冲突，伤害深重',
      lawsuit: '官司激烈，双方都受伤',
      health: '外伤风险极高，刀剑之伤',
      travel: '出行危险，暴力冲突',
      advice: '退避三舍，不可硬碰硬，保护自己'
    }
  },
  { 
    sky: '辛', earth: '辛', name: '伏吟天庭', 
    // summary: '公废私就，讼狱由己，自罹罪名', 
    summary: '公废私就，讼狱自罹罪名。凡事自败，有势难行。柔奸无用，门生宫则利主。宜收敛，凡事防自身、内部发生变化。',
    nature: 'inauspicious',
    details: {
      origin: '辛金重叠，刑狱之象，主自陷囹圄',
      career: '公事废弛，私事繁多',
      wealth: '公款可能有问题',
      marriage: '感情中自己犯错',
      lawsuit: '官司由自己引起，自食其果',
      health: '肺金受损，呼吸系统问题',
      travel: '出行因自己原因而出问题',
      advice: '公私分明，遵纪守法，不可因私废公'
    }
  },
  { 
    sky: '辛', earth: '壬', name: '凶蛇入狱', 
    // summary: '两男争女，讼狱不息，先动失理', 
    summary: '辛为牢狱，故名为凶蛇入狱，两男争女，讼狱不息，先动失理。凡事不利所谋，难成，防欺诈。',
    nature: 'inauspicious',
    details: {
      origin: '辛金生壬水，但入狱之象，主纠纷',
      career: '工作中有人争权夺利',
      wealth: '财运因争夺而损失',
      marriage: '感情三角关系，两男争女',
      lawsuit: '官司纠缠不休，难有了结',
      health: '肺肾不和，精力流失',
      travel: '出行遇纠纷，难以脱身',
      advice: '不要先动手，后发制人，先动失理'
    }
  },
  { 
    sky: '辛', earth: '癸', name: '天牢华盖', 
    // summary: '误入天网，动辄乖张，日月失明', 
    summary: '日月失明，误入天网，动止乖张。自投罗网，凡事先塞而后通。女子逢之有利，男子损财，易有酒食喜庆之事到来',
    nature: 'inauspicious',
    details: {
      origin: '辛金生癸水，但形成天牢，主被困',
      career: '事业误入歧途，难以回头',
      wealth: '财运被套牢，难以解脱',
      marriage: '感情误入困局，身不由己',
      lawsuit: '官司被困，难以脱身',
      health: '精神迷茫，看不清方向',
      travel: '出行迷失，误入歧途',
      advice: '悬崖勒马，及时回头，不可越陷越深'
    }
  },
  // 天盘壬
  { 
    sky: '壬', earth: '甲', 
    // name: '小蛇化龙', 
    // summary: '升迁得势，男人发达，女产婴童', 
    name: '蛇化为龙',
    summary: '因壬为小蛇，甲为青龙，故为小蛇化龙，凡事有阻谋，为暗昧。女子逢之则喜庆之事。男子遇之有始无终。',
    nature: 'auspicious',
    details: {
      origin: '壬水生甲木，如小蛇化龙，主升腾',
      career: '事业飞黄腾达，升迁在即',
      wealth: '财运大旺，投资获利丰厚',
      marriage: '姻缘美满，利于生育',
      lawsuit: '官司大胜，形势逆转',
      health: '身体康健，精力充沛',
      travel: '出行顺利，心想事成',
      advice: '把握机遇，大胆进取，化龙之时已到'
    }
  },
  { 
    sky: '壬', earth: '乙', name: '小蛇得势', 
    // summary: '女子温柔，男子发达，产子顺利', 
    summary: '女人柔顺，男人通旺，测孕育生子，禄马光华。犯空亡，凡为不利。',
    nature: 'auspicious',
    details: {
      origin: '壬水生乙木，阴阳相生，主顺遂',
      career: '事业稳步上升，发展顺利',
      wealth: '财运稳健，收入增加',
      marriage: '感情温馨，女子温柔贤惠',
      lawsuit: '诉讼顺利，有利于己',
      health: '身体康健，生育顺利',
      travel: '出行顺利，愉快轻松',
      advice: '顺势而为，温和待人，自然成功'
    }
  },
  { 
    sky: '壬', earth: '丙', name: '水蛇入火', 
    // summary: '官灾刑禁，络绎不绝，两败俱伤', 
    summary: '因壬丙相冲克，故主官灾刑禁，络绎不绝。凡事不利。如壬为直符，则为青龙回首格，主吉利，贵人来助。',
    nature: 'inauspicious',
    details: {
      origin: '壬水克丙火，水火相战，主冲突',
      career: '工作中激烈冲突，官非不断',
      wealth: '财运因冲突而损失',
      marriage: '感情水火不容，矛盾激烈',
      lawsuit: '官司激烈，双方都受损',
      health: '心肾不交，水火不济',
      travel: '出行遇冲突，危险重重',
      advice: '避免正面冲突，寻求和解，否则两败俱伤'
    }
  },
  { 
    sky: '壬', earth: '丁', name: '干合蛇刑', 
    // summary: '文书牵连，贵人匆匆，男吉女凶', 
    summary: '文语书牵连，文书财喜，大宜女子，贵人官禄，常人平安。',
    nature: 'neutral',
    details: {
      origin: '丁壬相合，但有刑克之象，主复杂',
      career: '工作有贵人但也有牵连',
      wealth: '财运有机会但有风险',
      marriage: '感情复杂，男方较有利',
      lawsuit: '官司有转机但也有牵连',
      health: '心肾调和但有暗疾',
      travel: '出行有贵人但行程匆忙',
      advice: '抓住机会，但需防范风险，男吉女需谨慎'
    }
  },
  { 
    sky: '壬', earth: '戊', 
    // name: '小蛇化龙', 
    // summary: '升迁得势，男人发达，女产婴童', 
    name: '蛇化为龙',
    summary: '因壬为小蛇，甲为青龙，故为小蛇化龙，凡事有阻谋，为暗昧。女子逢之则喜庆之事。男子遇之有始无终。',
    nature: 'auspicious',
    details: {
      origin: '戊土虽克壬水，但甲遁戊下，仍主升腾',
      career: '事业有阻力但终能克服，升迁可期',
      wealth: '财运需努力争取，终有回报',
      marriage: '感情需磨合，但终成眷属',
      lawsuit: '官司有阻力但能胜诉',
      health: '身体需调理，但能康复',
      travel: '出行有困难但能达成',
      advice: '克服困难，坚持就是胜利，化龙在即'
    }
  },
  { 
    sky: '壬', earth: '己', 
    // name: '反吟蛇刑', 
    // summary: '官司败诉，大祸将至，顺守可吉', 
    name: '凶蛇入狱', 
    summary: '主官讼败诉，大祸将至，顺守可吉，妄动必区。', 
    nature: 'inauspicious',
    details: {
      origin: '己土克壬水，如蛇入困境，主受制',
      career: '事业受阻，大麻烦将至',
      wealth: '财运遭遇重大损失',
      marriage: '感情遭遇危机，可能分离',
      lawsuit: '官司必败，需做好准备',
      health: '病情加重，需及时就医',
      travel: '不宜出行，在家静守',
      advice: '静守为上，不可妄动，等待灾难过去'
    }
  },
  { 
    sky: '壬', earth: '庚', name: '太白擒蛇', 
    // summary: '难以发展，刑狱公平，立判邪正', 
    summary: '因庚为太白。刑狱公明，好分正邪。如逢伤死二门，王杀伤之祸。',
    nature: 'inauspicious',
    details: {
      origin: '庚金生壬水，但被擒之象，主受制',
      career: '事业发展受限，难以突破',
      wealth: '财运有来源但被控制',
      marriage: '感情被对方控制',
      lawsuit: '官司公正判决，是非分明',
      health: '身体受制，需要调理',
      travel: '出行受限，不能自由',
      advice: '接受现实，公正对待，邪不胜正'
    }
  },
  { 
    sky: '壬', earth: '辛', 
    name: '螣蛇相缠', 
    // summary: '琐事缠绕，动荡不安，被人欺瞒', 
    summary: '因辛金入辰水之墓，故名为腾蛇相缠，纵得吉门，亦不能安宁，若有谋望，被人欺瞒。门制宫祸尤速，门生宫则可免祸侵。防内部欺瞒，主反复不定。',
    nature: 'inauspicious',
    details: {
      origin: '辛金生壬水，但缠绕之象，主纠缠',
      career: '工作琐事繁多，身心俱疲',
      wealth: '财运被琐事消耗',
      marriage: '感情被小事纠缠，争吵不断',
      lawsuit: '官司琐碎，难以了结',
      health: '精神疲惫，被琐事折磨',
      travel: '出行被琐事缠绕，难以成行',
      advice: '理清头绪，解决主要矛盾，不被琐事困扰'
    }
  },
  { 
    sky: '壬', earth: '壬', 
    // name: '天狱自刑', 
    // summary: '求谋无成，内起祸患，诸事破败', 
    name: '蛇入地罗',
    summary: '外人缠绕，内事索索，吉门吉星，庶免蹉跎。凡事破败难定',
    nature: 'inauspicious',
    details: {
      origin: '壬水重叠，水泛成灾，主泛滥',
      career: '事业失控，局面混乱',
      wealth: '财运溃败，资金外流',
      marriage: '感情泛滥，关系混乱',
      lawsuit: '官司失控，难以收场',
      health: '肾水太旺，水湿泛滥',
      travel: '出行遇水灾，需防溺水',
      advice: '控制局面，收敛行为，不可继续泛滥'
    }
  },
  { 
    sky: '壬', earth: '癸', 
    // name: '幼女奸淫', 
    // summary: '奸私隐情，家丑外扬，测婚不洁', 
    name: '腾蛇飞空',
    summary: '主有家丑外扬之事发生，门吉星凶，易反福内祸。',
    nature: 'inauspicious',
    details: {
      origin: '壬癸皆水，阴阳水混，主淫乱',
      career: '工作中有不正当关系',
      wealth: '财运与不正当交易有关',
      marriage: '感情不纯洁，有第三者',
      lawsuit: '官司涉及隐私丑闻',
      health: '肾水问题，泌尿生殖系统',
      travel: '出行有不正当目的',
      advice: '端正心态，洁身自好，远离不正当关系'
    }
  },
  // 天盘癸
  { 
    sky: '癸', earth: '甲', name: '天乙合会', 
    // summary: '婚姻财喜，合作投资，吉门可行', 
    summary: '吉门宜求财，婚姻喜美，吉人赞助成合。若门凶迫制，反祸官非。凡事虽吉，只宜阴谋私合，也有恩怨交加之象。',
    nature: 'auspicious',
    details: {
      origin: '癸水生甲木，阴阳相生，主和合',
      career: '事业合作顺利，有贵人相助',
      wealth: '财运通过合作获得，投资有利',
      marriage: '姻缘美满，婚姻幸福',
      lawsuit: '诉讼和解，皆大欢喜',
      health: '身体康健，阴阳调和',
      travel: '出行顺利，合作愉快',
      advice: '把握合作机会，吉门更佳，共创双赢'
    }
  },
  { 
    sky: '癸', earth: '乙', name: '华盖逢星', 
    // summary: '贵人禄位，常人平安，吉凶看门', 
    summary: '贵人禄位，常人平安。门吉则吉，门凶则区。日沉九地，有男性贵人扶持，暗中生助，但嫌迟疑不速。',
    nature: 'neutral',
    details: {
      origin: '癸水生乙木，如华盖护星，主庇护',
      career: '事业有贵人暗中保护',
      wealth: '财运有暗财，低调求财',
      marriage: '感情低调温馨',
      lawsuit: '官司有人暗助',
      health: '身体平安，有人照顾',
      travel: '出行平安，有人护佑',
      advice: '保持低调，借助贵人之力，看门定吉凶'
    }
  },
  { 
    sky: '癸', earth: '丙', name: '华盖悖师', 
    // summary: '贵贱不利，反凶为吉，因势利导', 
    summary: '贵贱逢之皆不利，唯上人见喜。凡事阴塞，贵人受官司，小人得依，若癸为直符，则为青龙回首格，主吉庆。', 
    nature: 'neutral',
    details: {
      origin: '癸水克丙火，但可因势利导，主转化',
      career: '事业先难后易，逆境中求生存',
      wealth: '财运先损后得，因祸得福',
      marriage: '感情先苦后甜，磨合后更好',
      lawsuit: '官司可以反转，化被动为主动',
      health: '病情可以转好，积极治疗',
      travel: '出行先阻后通，灵活应变',
      advice: '因势利导，化被动为主动，反凶为吉'
    }
  },
  { 
    sky: '癸', earth: '丁', name: '螣蛇夭矫', 
    // summary: '文书口舌，音信沉溺，火焚难逃', 
    summary: '文书官司，火焚也逃不掉。凡事不利，求吉反区，成不利文书，合同，官司，合作。',
    nature: 'inauspicious',
    details: {
      origin: '癸水克丁火，文星受克，主口舌',
      career: '工作中口舌是非多，文书问题',
      wealth: '财运因口舌而损失',
      marriage: '感情争吵不断，沟通不畅',
      lawsuit: '官司口舌纠缠，难以了结',
      health: '心肾不交，失眠多梦',
      travel: '出行遇口舌，纠纷不断',
      advice: '谨言慎行，少说多做，避免口舌之争'
    }
  },
  { 
    sky: '癸', earth: '戊', name: '天乙合会', 
    // summary: '婚姻财喜，合作投资，吉门可行', 
    summary: '吉门宜求财，婚姻喜美，吉人赞助成合。若门凶迫制，反祸官非。凡事虽吉，只宜阴谋私合，也有恩怨交加之象。',
    nature: 'auspicious',
    details: {
      origin: '戊癸相合，土水相济，主和合成事',
      career: '事业合作顺利，资源整合',
      wealth: '财运通过合作大增',
      marriage: '姻缘天成，婚姻美满',
      lawsuit: '诉讼和解，圆满收场',
      health: '脾肾调和，身体健康',
      travel: '出行顺利，合作愉快',
      advice: '把握合作良机，共同发展，吉门大利'
    }
  },
  { 
    sky: '癸', earth: '己', name: '华盖地户', 
    // summary: '阴阳不和，音信皆阻，躲避为吉', 
    summary: '男女测之，音信皆阻，此格躲穴避难方为吉。得吉门尚可为之。',
    nature: 'inauspicious',
    details: {
      origin: '己土克癸水，阴阳失调，主阻滞',
      career: '事业不顺，消息不通',
      wealth: '财运受阻，资金不畅',
      marriage: '感情阴阳失调，沟通不畅',
      lawsuit: '官司信息不通，判决拖延',
      health: '脾肾不和，代谢问题',
      travel: '出行受阻，消息断绝',
      advice: '避开锋芒，等待时机，躲避为上策'
    }
  },
  { 
    sky: '癸', earth: '庚', name: '太白入网', 
    // summary: '吉事成空，暴力争讼，自罹罪责', 
    summary: '主以暴力争讼，自罹罪责。凡谋事无成，吉事成空。',
    nature: 'inauspicious',
    details: {
      origin: '庚金生癸水入网，主被困',
      career: '事业被困，难以突破',
      wealth: '财运被套，资金难回',
      marriage: '感情被困，难以脱身',
      lawsuit: '官司中自己也有责任',
      health: '肺肾受困，身体虚弱',
      travel: '出行被困，行动受限',
      advice: '寻找突破口，不可坐以待毙，承担责任'
    }
  },
  { 
    sky: '癸', earth: '辛', name: '网盖天牢', 
    // summary: '官司败诉，死罪难逃，测病大凶',
    summary: '主官司败诉，死罪难逃；测病亦大凶。凡事费力而后有成，其究竟是天牢还是受恩主要通过八神和用神总体来识别。', 
    nature: 'inauspicious',
    details: {
      origin: '辛金生癸水，但形成天牢，主大凶',
      career: '事业遭遇灭顶之灾',
      wealth: '财运全失，倾家荡产',
      marriage: '感情彻底破裂，难以挽回',
      lawsuit: '官司大败，可能入狱',
      health: '病情危重，生命垂危',
      travel: '不宜出行，凶险异常',
      advice: '紧急应对，寻求专业帮助，不可延误'
    }
  },
  { 
    sky: '癸', earth: '壬', name: '复见螣蛇', 
    // summary: '嫁娶重婚，后嫁无子，不保年华', 
    summary: '主嫁娶重婚，后嫁无子，不保年华。凡事不利，且无定见，上下蒙蔽。阴人绝子，嫁娶重婚，不保年华。',
    nature: 'inauspicious',
    details: {
      origin: '壬癸皆水，水气泛滥，主混乱',
      career: '事业混乱，重复劳动',
      wealth: '财运反复，今日有明日无',
      marriage: '感情混乱，可能重婚或再婚',
      lawsuit: '官司反复，难有定论',
      health: '肾水泛滥，生育困难',
      travel: '出行反复，难以成行',
      advice: '理清思路，不可混乱，专注一事'
    }
  },
  { 
    sky: '癸', earth: '癸', name: '天网四张', 
    // summary: '行人失伴，病讼皆伤，不可谋为', 
    summary: '主行人失伴，病讼皆伤。凡事重重闭塞，屈抑不伸，宜伏匿积水开渠。',
    nature: 'inauspicious',
    details: {
      origin: '癸水重叠，如天网四张，主困顿',
      career: '事业四面楚歌，无处可逃',
      wealth: '财运四面受困，难以突破',
      marriage: '感情四面楚歌，孤立无援',
      lawsuit: '官司必败，四面楚歌',
      health: '病情严重，肾水衰竭',
      travel: '行人失伴，孤独无援',
      advice: '万事不可为，静待天时，不可强求'
    }
  },
];

interface SymbolCardProps {
  symbol: QimenSymbolInfo;
}

const SymbolCard: React.FC<SymbolCardProps> = ({ symbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const natureColors = NATURE_COLORS[symbol.nature];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                  natureColors.bg, natureColors.text
                )}>
                  {symbol.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{symbol.name}</h3>
                    {symbol.alias && (
                      <span className="text-xs text-muted-foreground">({symbol.alias})</span>
                    )}
                    <Badge variant="outline" className={cn("text-xs", natureColors.text, natureColors.border)}>
                      {NATURE_LABELS[symbol.nature]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {symbol.element && <span>五行：{symbol.element}</span>}
                    {symbol.direction && <span>· 方位：{symbol.direction}</span>}
                  </div>
                </div>
              </div>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Personality Section */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium">
                <User className="h-4 w-4" />
                <span>性格特征</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {symbol.personality.traits.map((trait, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-green-600">✓ 优势</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {symbol.personality.strengths.map((s, i) => (
                      <li key={i} className="list-disc">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-amber-600">! 提醒</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {symbol.personality.weaknesses.map((w, i) => (
                      <li key={i} className="list-disc">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Health Section */}
            <div className="bg-rose-500/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-medium">
                <Heart className="h-4 w-4" />
                <span>健康提示</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">关注部位：</span>
                  <span className="text-sm text-muted-foreground">
                    {symbol.health.bodyParts.join('、')}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">健康风险：</span>
                  <span className="text-sm text-muted-foreground">
                    {symbol.health.risks.join('、')}
                  </span>
                </div>
                <div className="text-sm bg-background/50 rounded p-2">
                  <span className="font-medium">建议：</span>
                  <span className="text-muted-foreground">{symbol.health.advice}</span>
                </div>
              </div>
            </div>

            {/* Life Path Section */}
            <div className="bg-blue-500/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Briefcase className="h-4 w-4" />
                <span>人生轨道</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">适合职业：</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {symbol.lifePath.career.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-blue-500/30 text-blue-600">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">发展方向：</span>
                  <span className="text-muted-foreground">{symbol.lifePath.direction}</span>
                </div>
                <div className="text-sm bg-background/50 rounded p-2">
                  <span className="font-medium">命理建议：</span>
                  <span className="text-muted-foreground">{symbol.lifePath.advice}</span>
                </div>
              </div>
            </div>

            {/* Communication Section */}
            <div className="bg-purple-500/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <MessageCircle className="h-4 w-4" />
                <span>语商分析 · {symbol.communication.style}</span>
              </div>
              
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-green-600">✓ 沟通优势</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {symbol.communication.strengths.map((s, i) => (
                      <li key={i} className="list-disc">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-amber-600">! 沟通盲区</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {symbol.communication.weaknesses.map((w, i) => (
                      <li key={i} className="list-disc">{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm bg-background/50 rounded p-2">
                  <span className="font-medium">沟通建议：</span>
                  <span className="text-muted-foreground">{symbol.communication.advice}</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

interface SymbolSectionProps {
  symbols: QimenSymbolInfo[];
  description: string;
}

const SymbolSection: React.FC<SymbolSectionProps> = ({ symbols, description }) => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground text-center mb-4">{description}</p>
    {symbols.map((symbol) => (
      <SymbolCard key={symbol.id} symbol={symbol} />
    ))}
  </div>
);

// 五行颜色映射
const ELEMENT_COLORS: Record<string, { bg: string; text: string }> = {
  '水': { bg: 'bg-blue-500/20', text: 'text-blue-600' },
  '木': { bg: 'bg-green-500/20', text: 'text-green-600' },
  '火': { bg: 'bg-red-500/20', text: 'text-red-600' },
  '土': { bg: 'bg-amber-500/20', text: 'text-amber-600' },
  '金': { bg: 'bg-slate-400/20', text: 'text-slate-500' },
};

// 宫位卡片组件
interface PalaceCardProps {
  palace: PalaceInfo;
}

const PalaceCard: React.FC<PalaceCardProps> = ({ palace }) => {
  const [isOpen, setIsOpen] = useState(false);
  const elementColors = ELEMENT_COLORS[palace.element] || ELEMENT_COLORS['土'];
  const natureColors = NATURE_COLORS[palace.nature];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold shrink-0",
                elementColors.bg
              )}>
                <span className={cn("text-lg font-bold", elementColors.text)}>{palace.bagua}</span>
                <span className="text-xs text-muted-foreground">{palace.element}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{palace.name} · {palace.bagua}卦</span>
                  <Badge variant="outline" className={cn("text-xs", natureColors.text, natureColors.border)}>
                    {NATURE_LABELS[palace.nature]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {palace.direction}
                  </Badge>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform ml-auto shrink-0",
                    isOpen && "rotate-180"
                  )} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {palace.meaning.keywords.slice(0, 4).map((keyword, idx) => (
                    <span key={idx} className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* 核心象意 */}
            <div className={cn("rounded-lg p-3", elementColors.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <Home className={cn("h-4 w-4", elementColors.text)} />
                <span className={cn("font-medium", elementColors.text)}>核心象意</span>
              </div>
              <p className="text-sm">{palace.meaning.core}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {palace.meaning.keywords.map((keyword, idx) => (
                  <span key={idx} className="text-xs bg-background/60 px-2 py-0.5 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* 人物类象 */}
            <div className="bg-purple-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">人物类象</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">家庭：</span>
                  <span>{palace.people.family.join('、')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">社会：</span>
                  <span>{palace.people.social.join('、')}</span>
                </div>
              </div>
            </div>

            {/* 身体部位 */}
            <div className="bg-rose-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-rose-600" />
                <span className="font-medium text-rose-600">身体部位</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {palace.bodyParts.map((part, idx) => (
                  <span key={idx} className="text-sm bg-background/60 px-2 py-0.5 rounded">
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* 行业类象 */}
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">行业类象</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {palace.industries.map((industry, idx) => (
                  <span key={idx} className="text-sm bg-background/60 px-2 py-0.5 rounded">
                    {industry}
                  </span>
                ))}
              </div>
            </div>

            {/* 物品类象 */}
            <div className="bg-amber-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-600">物品类象</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {palace.objects.map((obj, idx) => (
                  <span key={idx} className="text-sm bg-background/60 px-2 py-0.5 rounded">
                    {obj}
                  </span>
                ))}
              </div>
            </div>

            {/* 时间应期 */}
            <div className="bg-blue-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">时间应期</span>
              </div>
              <p className="text-sm">{palace.timing}</p>
            </div>

            {/* 断事要点 */}
            <div className="bg-green-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">断事要点</span>
              </div>
              <p className="text-sm">{palace.advice}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// 宫位部分
const PalaceSection: React.FC = () => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground text-center mb-4">
      九宫代表空间方位，每宫有其独特的象意、人物、身体、行业等类象
    </p>
    {NINE_PALACES.map((palace) => (
      <PalaceCard key={palace.id} palace={palace} />
    ))}
  </div>
);

// 克应卡片组件
interface KeYingCardProps {
  item: KeYingItem;
}

const KeYingCard: React.FC<KeYingCardProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const natureColors = NATURE_COLORS[item.nature];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold shrink-0",
                natureColors.bg
              )}>
                <span className="text-xs text-muted-foreground">天{item.sky}</span>
                <span className="text-xs text-muted-foreground">地{item.earth}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{item.name}</span>
                  <Badge variant="outline" className={cn("text-xs", natureColors.text, natureColors.border)}>
                    {NATURE_LABELS[item.nature]}
                  </Badge>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform ml-auto shrink-0",
                    isOpen && "rotate-180"
                  )} />
                </div>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {/* 象意来源 */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">象意来源</div>
              <p className="text-sm">{item.details.origin}</p>
            </div>

            {/* 六大维度分析 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">事业</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.details.career}</p>
              </div>

              <div className="bg-amber-500/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600">求财</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.details.wealth}</p>
              </div>

              <div className="bg-pink-500/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Heart className="h-3.5 w-3.5 text-pink-600" />
                  <span className="text-xs font-medium text-pink-600">婚姻感情</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.details.marriage}</p>
              </div>

              <div className="bg-purple-500/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">诉讼官司</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.details.lawsuit}</p>
              </div>

              <div className="bg-rose-500/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-600" />
                  <span className="text-xs font-medium text-rose-600">健康</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.details.health}</p>
              </div>

              <div className="bg-blue-500/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">出行</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.details.travel}</p>
              </div>
            </div>

            {/* 应对建议 */}
            <div className={cn("rounded-lg p-3", natureColors.bg)}>
              <div className="text-xs font-medium mb-1.5">应对建议</div>
              <p className="text-sm font-medium">{item.details.advice}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// 十干克应部分
const KeYingSection: React.FC = () => {
  const [selectedSky, setSelectedSky] = useState<string>('甲');

  const filteredData = KE_YING_DATA.filter(item => item.sky === selectedSky);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        天盘干与地盘干的组合象意，共100个组合，依据《御定奇门宝鉴》
      </p>

      {/* 天盘干选择器 */}
      <div className="flex flex-wrap justify-center gap-2">
        {STEMS_LIST.map((stem) => (
          <Button
            key={stem}
            variant={selectedSky === stem ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSky(stem)}
            className="w-10 h-10"
          >
            {stem}
          </Button>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        天盘 <span className="font-bold text-primary text-lg">{selectedSky}</span> 加临地盘各干
      </div>

      {/* 克应列表 */}
      <div className="space-y-2">
        {filteredData.map((item, idx) => (
          <KeYingCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

// 值符值使知识卡片
const ZhiFuZhiShiKnowledgeCard: React.FC<{ data: ZhiFuZhiShiKnowledge; icon: React.ReactNode }> = ({ data, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const SECTION_COLORS: Record<string, { bg: string; text: string }> = {
    auspicious: { bg: 'bg-green-500/10', text: 'text-green-600' },
    inauspicious: { bg: 'bg-rose-500/10', text: 'text-rose-600' },
    neutral: { bg: 'bg-slate-500/10', text: 'text-slate-600' },
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              {icon}
              <span className="font-semibold flex-1">{data.title}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3">
            {data.sections.map((section, idx) => {
              const colors = SECTION_COLORS[section.nature];
              return (
                <div key={idx} className={`${colors.bg} rounded-lg p-3 space-y-2`}>
                  <div className={`text-sm font-medium ${colors.text}`}>{section.heading}</div>
                  <ul className="space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-1.5">
                        <span className={`shrink-0 ${colors.text}`}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// 值符值使部分
const ZhiFuZhiShiSection: React.FC = () => (
  <div className="space-y-3">
    <p className="text-sm text-muted-foreground text-center mb-4">
      值符代表领导力与权威，值使代表执行力，两者关系决定事件成败
    </p>
    <ZhiFuZhiShiKnowledgeCard 
      data={ZHIFU_KNOWLEDGE} 
      icon={<Crown className="h-5 w-5 text-amber-500" />} 
    />
    <ZhiFuZhiShiKnowledgeCard 
      data={ZHISHI_KNOWLEDGE} 
      icon={<Swords className="h-5 w-5 text-blue-500" />} 
    />
  </div>
);

// 卦象数据
const DOOR_LIST = ['休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门'];
const STAR_LIST = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
const PALACE_LIST = [
  { id: 1, name: '坎一宫' },
  { id: 2, name: '坤二宫' },
  { id: 3, name: '震三宫' },
  { id: 4, name: '巽四宫' },
  { id: 6, name: '乾六宫' },
  { id: 7, name: '兑七宫' },
  { id: 8, name: '艮八宫' },
  { id: 9, name: '离九宫' },
];

// 卦象卡片
const HexagramEncCard: React.FC<{ hex: HexagramInfo; label: string }> = ({ hex, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-indigo-500/15 flex flex-col items-center justify-center shrink-0">
                <span className="text-lg leading-none">{hex.upperSymbol}</span>
                <span className="text-lg leading-none">{hex.lowerSymbol}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">{hex.name}</span>
                  <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-500/30">
                    {label}
                  </Badge>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform ml-auto shrink-0",
                    isOpen && "rotate-180"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {hex.upperLabel}({hex.upperTrigram}) ↑ · {hex.lowerLabel}({hex.lowerTrigram}) ↓
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3">
            {hex.meaning && (
              <div className="bg-indigo-500/5 rounded-lg p-3">
                <p className="text-sm leading-relaxed">{hex.meaning}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// 卦象部分
const HexagramSection: React.FC = () => {
  const [mode, setMode] = useState<'doorPalace' | 'starDoor'>('doorPalace');
  const [selectedDoor, setSelectedDoor] = useState('休门');
  const [selectedStar, setSelectedStar] = useState('天蓬');

  const hexagrams: { hex: HexagramInfo; label: string }[] = [];

  if (mode === 'doorPalace') {
    for (const p of PALACE_LIST) {
      const hex = getDoorPalaceHexagram(selectedDoor, p.id);
      if (hex) hexagrams.push({ hex, label: `${selectedDoor}·${p.name}` });
    }
  } else {
    for (const door of DOOR_LIST) {
      const hex = getStarDoorHexagram(selectedStar, door);
      if (hex) hexagrams.push({ hex, label: `${selectedStar}·${door}` });
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        依据《御定奇门宝鉴》，门宫卦以门为上卦、宫为下卦；星门卦以星为上卦、门为下卦
      </p>

      {/* 门宫卦 / 星门卦 切换 */}
      <div className="flex justify-center gap-2">
        <Button
          variant={mode === 'doorPalace' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('doorPalace')}
        >
          门宫卦
        </Button>
        <Button
          variant={mode === 'starDoor' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('starDoor')}
        >
          星门卦
        </Button>
      </div>

      {/* 选择器 */}
      {mode === 'doorPalace' ? (
        <div className="flex flex-wrap justify-center gap-2">
          {DOOR_LIST.map((door) => (
            <Button
              key={door}
              variant={selectedDoor === door ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDoor(door)}
              className="h-9 px-3"
            >
              {door}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {STAR_LIST.map((star) => (
            <Button
              key={star}
              variant={selectedStar === star ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStar(star)}
              className="h-9 px-3"
            >
              {star}
            </Button>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        {mode === 'doorPalace'
          ? <>以 <span className="font-bold text-primary text-lg">{selectedDoor}</span> 为上卦，加临各宫</>
          : <>以 <span className="font-bold text-primary text-lg">{selectedStar}</span> 为上卦，加临各门</>
        }
      </div>

      {/* 卦象列表 */}
      <div className="space-y-2">
        {hexagrams.map((item, idx) => (
          <HexagramEncCard key={idx} hex={item.hex} label={item.label} />
        ))}
      </div>
    </div>
  );
};

const QimenEncyclopedia: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold flex-1">奇门全书</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        <Tabs defaultValue="palaces" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-8">
            <TabsTrigger value="palaces" className="text-xs">宫位</TabsTrigger>
            <TabsTrigger value="gates" className="text-xs">八门</TabsTrigger>
            <TabsTrigger value="stars" className="text-xs">九星</TabsTrigger>
            <TabsTrigger value="gods" className="text-xs">八神</TabsTrigger>
            <TabsTrigger value="stems" className="text-xs">奇仪</TabsTrigger>
            <TabsTrigger value="zhifushi" className="text-xs">符使</TabsTrigger>
            <TabsTrigger value="keying" className="text-xs">克应</TabsTrigger>
            <TabsTrigger value="hexagram" className="text-xs">卦象</TabsTrigger>
          </TabsList>

          <TabsContent value="palaces">
            <PalaceSection />
          </TabsContent>

          <TabsContent value="gates">
            <SymbolSection 
              symbols={EIGHT_GATES}
              description="八门代表人事状态，开休生为三吉门，伤杜景死惊为凶门"
            />
          </TabsContent>

          <TabsContent value="stars">
            <SymbolSection 
              symbols={NINE_STARS}
              description="九星代表天时运势，源自北斗七星加左辅右弼"
            />
          </TabsContent>

          <TabsContent value="gods">
            <SymbolSection 
              symbols={EIGHT_GODS}
              description="八神代表宇宙能量，值符太阴六合九地九天为吉神"
            />
          </TabsContent>

          <TabsContent value="stems">
            <SymbolSection 
              symbols={STEMS}
              description="三奇六仪代表天干能量，乙丙丁为三奇，戊己庚辛壬癸为六仪"
            />
          </TabsContent>

          <TabsContent value="zhifushi">
            <ZhiFuZhiShiSection />
          </TabsContent>

          <TabsContent value="keying">
            <KeYingSection />
          </TabsContent>

          <TabsContent value="hexagram">
            <HexagramSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QimenEncyclopedia;
