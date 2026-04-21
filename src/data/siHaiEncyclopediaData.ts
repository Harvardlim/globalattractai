// 四害宝典数据 - 基于《御定奇门宝鉴》

export interface SiHaiInfo {
  id: string;
  name: string;
  alias: string;
  nature: 'harmful';
  severity: 'high' | 'medium' | 'low';
  keywords: string[];
  definition: string;
  principle: string;
  conditions: {
    description: string;
    examples: string[];
  };
  palaceRules: {
    description: string;
    details: string[];
  };
  symbolRules: {
    description: string;
    details: string[];
  };
  interpretation: {
    general: string;
    career: string;
    wealth: string;
    health: string;
    relationships: string;
  };
  remedies: string[];
}

export const SI_HAI_DATA: SiHaiInfo[] = [
  {
    id: 'kong_wang',
    name: '空亡',
    alias: '旬空',
    nature: 'harmful',
    severity: 'high',
    keywords: ['虚无', '落空', '不实', '未成', '延迟', '变数'],
    definition: '空亡又称旬空，是十天干与十二地支相配时，每一旬中有两个地支无天干相配，称为空亡。',
    principle: '六十甲子分为六旬，每旬十天干配十地支，余二支为空亡。空亡之支所在宫位，其象意减力或落空。',
    conditions: {
      description: '空亡的判定基于日柱所在的旬：',
      examples: [
        '甲子旬：戌亥空',
        '甲戌旬：申酉空',
        '甲申旬：午未空',
        '甲午旬：辰巳空',
        '甲辰旬：寅卯空',
        '甲寅旬：子丑空',
      ],
    },
    palaceRules: {
      description: '空亡地支所在宫位受影响：',
      details: [
        '1宫（坎）：子空 - 事业根基不稳，贵人难助',
        '2宫（坤）：未空 - 母缘薄，房产延迟',
        '3宫（震）：卯空 - 兄弟无力，创业艰难',
        '4宫（巽）：辰巳空 - 文书不成，合同有变',
        '6宫（乾）：戌亥空 - 领导不力，贵人落空',
        '7宫（兑）：酉空 - 口舌是非，女性缘薄',
        '8宫（艮）：丑寅空 - 少年运滞，房产不顺',
        '9宫（离）：午空 - 名声虚浮，心神不宁',
      ],
    },
    symbolRules: {
      description: '落入空亡宫的符号影响：',
      details: [
        '值符空亡：贵人无力，求助落空',
        '值使空亡：办事不成，计划延迟',
        '日干空亡：求测者本人运势受阻',
        '用神空亡：所求之事难成，需等待时机',
        '年命空亡：流年多变，诸事不定',
        '吉门空亡：吉事减半，好事多磨',
        '凶门空亡：凶事化解，反为解脱',
      ],
    },
    interpretation: {
      general: '空亡主事物虚无、落空、延迟。吉神落空则吉事不成，凶神落空则凶事化解。需等待空亡填实之时。',
      career: '空亡见于事业宫，主职位不稳、升迁受阻、贵人远离。宜守不宜进，待时而动。',
      wealth: '财星落空，求财不得，投资亏损。但若为破财之象落空，反主财不外泄。',
      health: '空亡见于身体宫位，主精气不足、虚症为多。心理层面易感空虚、迷茫。',
      relationships: '感情宫位空亡，主缘分未到、姻缘迟来。已婚者夫妻感情疏离。',
    },
    remedies: [
      '等待填实：空亡地支逢冲或合之年月日时，可填实空亡',
      '避开空亡时辰行事',
      '加强自身实力，不依赖外力',
      '凶事落空反为吉兆，顺其自然',
    ],
  },
  {
    id: 'ru_mu',
    name: '入墓',
    alias: '落墓',
    nature: 'harmful',
    severity: 'high',
    keywords: ['被困', '受制', '不通', '阻滞', '收藏', '潜伏'],
    definition: '入墓是指天干落入其墓库之地支所在的宫位，象征被困、受制、能量被收藏无法发挥。',
    principle: '五行各有其墓库：木墓在未，火墓在戌，金墓在丑，水墓在辰，土墓在戌（或辰）。天干入墓则力量被锁。',
    conditions: {
      description: '各天干入墓的宫位：',
      examples: [
        '甲乙木：入墓于2宫（坤，未）',
        '丙丁火：入墓于6宫（乾，戌）',
        '庚辛金：入墓于8宫（艮，丑）',
        '壬癸水：入墓于4宫（巽，辰）',
        '戊己土：入墓于6宫（乾，戌）或4宫（巽，辰）',
      ],
    },
    palaceRules: {
      description: '入墓的宫位象意：',
      details: [
        '2宫入墓：木被土困，事业受压制，母亲问题',
        '4宫入墓：水入库中，文书受阻，思路不清',
        '6宫入墓：火土入库，权力受限，领导压制',
        '8宫入墓：金被困锁，少年不顺，财物被压',
      ],
    },
    symbolRules: {
      description: '入墓符号的影响：',
      details: [
        '日干入墓：求测者被困，诸事不顺，有心无力',
        '时干入墓：结果受阻，事情难成',
        '用神入墓：所求之人或事被困，无法发挥作用',
        '值符入墓：贵人被压制，难以相助',
        '财星入墓：财被锁住，难以获得（但也主有库存）',
        '官星入墓：仕途受阻，领导不力',
      ],
    },
    interpretation: {
      general: '入墓主被困、受制、潜伏、收藏。事物能量被锁住无法发挥，需待冲开墓库方能释放。',
      career: '事业入墓，主职位被压、晋升无望、才华难展。需忍耐等待，或借外力冲开。',
      wealth: '财星入墓，主财运受阻但有储蓄。适合积累，不适合大额投资或变现。',
      health: '身体入墓，主慢性病、暗疾、精力不济。易有抑郁、胸闷之象。',
      relationships: '感情入墓，主缘分被困、有缘难聚。双方可能有阻碍或压力。',
    },
    remedies: [
      '等待墓库被冲：逢冲之年月日时可开墓',
      '借助贵人外力打开局面',
      '韬光养晦，积累实力',
      '入墓也主收藏，可用于存储、保管之事',
    ],
  },
  {
    id: 'ji_xing',
    name: '击刑',
    alias: '刑克',
    nature: 'harmful',
    severity: 'medium',
    keywords: ['冲突', '争斗', '伤害', '矛盾', '官非', '破败'],
    definition: '击刑是指地支之间的刑害关系，包括三刑、自刑等，主冲突、矛盾、刑伤之象。',
    principle: '地支相刑，主内部冲突、自相矛盾。刑比冲更隐蔽，常主内伤、暗害、法律纠纷。',
    conditions: {
      description: '地支相刑的类型：',
      examples: [
        '寅巳申三刑：无恩之刑，主恩将仇报',
        '丑戌未三刑：恃势之刑，主仗势欺人',
        '子卯相刑：无礼之刑，主以下犯上',
        '辰辰自刑：自我消耗',
        '午午自刑：自我煎熬',
        '酉酉自刑：自我伤害',
        '亥亥自刑：自我困扰',
      ],
    },
    palaceRules: {
      description: '各宫位击刑的象意：',
      details: [
        '1宫被刑：根基动摇，贵人变敌',
        '2宫被刑：家庭矛盾，母亲是非',
        '3宫被刑：兄弟反目，合作破裂',
        '4宫被刑：文书官司，合同纠纷',
        '6宫被刑：领导冲突，官非牢狱',
        '7宫被刑：口舌争端，配偶矛盾',
        '8宫被刑：房产纠纷，兄弟争财',
        '9宫被刑：名誉受损，心神不宁',
      ],
    },
    symbolRules: {
      description: '符号受击刑的影响：',
      details: [
        '日干受刑：求测者遭受刑克，诸事不顺',
        '用神受刑：所求之事有阻碍或纠纷',
        '值符受刑：贵人受困或反成敌人',
        '开门受刑：事业有官非或法律纠纷',
        '生门受刑：财运受损，投资失利',
        '伤门受刑：伤害加重，需防意外',
      ],
    },
    interpretation: {
      general: '击刑主冲突、矛盾、法律纠纷。不同于冲的外来对抗，刑多为内部矛盾、自我消耗。',
      career: '事业被刑，主职场斗争、同事排挤、领导打压。容易卷入是非，需谨言慎行。',
      wealth: '财星被刑，主投资失误、合同纠纷、财务官司。不宜冒险投资。',
      health: '身体受刑，主外伤、手术、慢性病加重。心理上易有压抑、焦虑。',
      relationships: '感情受刑，主争吵、冷战、第三者。严重者有分离之象。',
    },
    remedies: [
      '谨言慎行，避免口舌是非',
      '处理好人际关系，化解矛盾',
      '法律文书务必谨慎',
      '寅巳申三刑见贵人可解',
      '合可解刑：找相合的地支化解',
    ],
  },
  {
    id: 'men_po',
    name: '门迫',
    alias: '迫宫',
    nature: 'harmful',
    severity: 'medium',
    keywords: ['受压', '克制', '不顺', '阻碍', '被迫', '无奈'],
    definition: '门迫是指八门落入克制其五行的宫位，门被宫所克，主事情受阻、被迫无奈。',
    principle: '门有五行属性，宫有五行属性。当门落入克己之宫，谓之门迫。如木门入金宫，火门入水宫等。',
    conditions: {
      description: '八门五行与被迫宫位：',
      examples: [
        '休门（水）：入2宫（土）、8宫（土）被迫',
        '生门（土）：入3宫（木）被迫',
        '伤门（木）：入6宫（金）、7宫（金）被迫',
        '杜门（木）：入6宫（金）、7宫（金）被迫',
        '景门（火）：入1宫（水）被迫',
        '死门（土）：入3宫（木）被迫',
        '惊门（金）：入9宫（火）被迫',
        '开门（金）：入9宫（火）被迫',
      ],
    },
    palaceRules: {
      description: '门迫在各宫的影响：',
      details: [
        '1宫门迫：事业受阻，根基被动摇',
        '2宫门迫：家事不顺，房产有碍',
        '3宫门迫：行动受限，出行不利',
        '4宫门迫：文书被拒，考试失利',
        '6宫门迫：求官无门，贵人不助',
        '7宫门迫：口舌是非，交涉不顺',
        '8宫门迫：投资受挫，财路不通',
        '9宫门迫：名声受损，心愿难达',
      ],
    },
    symbolRules: {
      description: '各门受迫的具体影响：',
      details: [
        '开门受迫：仕途受阻，事业不顺',
        '休门受迫：贵人不力，休养不成',
        '生门受迫：求财不得，生意难做',
        '伤门受迫：出行不利，行动受阻',
        '杜门受迫：隐藏不成，秘密泄露',
        '景门受迫：考试失利，名声受损',
        '死门受迫：事情僵死，变化更难',
        '惊门受迫：惊恐加倍，口舌更多',
      ],
    },
    interpretation: {
      general: '门迫主事物受克制、被迫害、力量被削弱。即使是吉门受迫，吉力也大打折扣。',
      career: '开门受迫主仕途不顺，有才难展，贵人远离。宜守不宜进。',
      wealth: '生门受迫主求财困难，投资亏损，合作不顺。不宜大额投资。',
      health: '门迫于身体宫位，主相应脏腑受克，需注意调养。',
      relationships: '门迫于感情宫，主双方有压力、矛盾、难以顺遂。',
    },
    remedies: [
      '等待门转入相生之宫的时机',
      '借助其他吉神吉格化解',
      '顺势而为，不强求',
      '门迫之时宜守成，不宜开创',
    ],
  },
];

// 四害速查表 - 根据宫位快速查询
export const SI_HAI_PALACE_QUICK_REF: Record<number, {
  kongWang: string[];
  ruMu: string[];
  jiXing: string[];
  menPo: string[];
}> = {
  1: {
    kongWang: ['子空'],
    ruMu: [],
    jiXing: ['子卯刑'],
    menPo: ['景门入坎'],
  },
  2: {
    kongWang: ['未空'],
    ruMu: ['木入墓'],
    jiXing: [],
    menPo: ['休门入坤'],
  },
  3: {
    kongWang: ['卯空'],
    ruMu: [],
    jiXing: ['子卯刑'],
    menPo: ['生门入震', '死门入震'],
  },
  4: {
    kongWang: ['辰空', '巳空'],
    ruMu: ['水入墓'],
    jiXing: ['辰自刑'],
    menPo: [],
  },
  6: {
    kongWang: ['戌空', '亥空'],
    ruMu: ['火入墓', '土入墓'],
    jiXing: ['丑戌未刑'],
    menPo: ['伤门入乾', '杜门入乾'],
  },
  7: {
    kongWang: ['酉空'],
    ruMu: [],
    jiXing: ['酉自刑'],
    menPo: ['伤门入兑', '杜门入兑'],
  },
  8: {
    kongWang: ['丑空', '寅空'],
    ruMu: ['金入墓'],
    jiXing: ['丑戌未刑', '寅巳申刑'],
    menPo: ['休门入艮'],
  },
  9: {
    kongWang: ['午空'],
    ruMu: [],
    jiXing: ['午自刑'],
    menPo: ['开门入离', '惊门入离'],
  },
};

// ===== 四害化解方法 =====

// 化解决策表 - 根据本宫与对宫情况判断
export interface RemedyDecision {
  id: string;
  selfPalace: string;      // 本宫情况
  oppositePalace: string;  // 对宫情况
  method: string;          // 化解方法
  description: string;     // 详细说明
}

export const REMEDY_DECISION_TABLE: RemedyDecision[] = [
  {
    id: 'case1',
    selfPalace: '入墓',
    oppositePalace: '无四害',
    method: '对宫符号冲',
    description: '本宫入墓但对宫无四害时，用对宫符号冲开本宫墓库',
  },
  {
    id: 'case2',
    selfPalace: '入墓 + 击刑/门迫',
    oppositePalace: '无四害',
    method: '处理本宫',
    description: '本宫有多重四害但对宫干净时，需直接处理本宫问题',
  },
  {
    id: 'case3',
    selfPalace: '入墓',
    oppositePalace: '入墓',
    method: '处理任一',
    description: '双方都入墓时，处理任意一宫即可打破僵局',
  },
  {
    id: 'case4',
    selfPalace: '入墓',
    oppositePalace: '击刑/门迫',
    method: '处理对宫即可',
    description: '本宫入墓、对宫有刑迫时，优先处理对宫问题',
  },
];

// 特殊化解注意事项
export const SPECIAL_REMEDY_NOTES: string[] = [
  '任一宫位有白虎、庚金，先用乙奇安抚',
  '白虎主血光、凶险，庚金主阻隔、刑伤',
  '乙奇为太阴之精，可柔化金气，缓解凶象',
];

// 具体化解物品与方法
export interface RemedyMethod {
  id: string;
  category: string;
  name: string;
  items: string[];
  usage: string;
  applicableTo: string[];
}

export const REMEDY_METHODS: RemedyMethod[] = [
  // ===== 空亡化解方法 =====
  {
    id: 'move_mouth_kongwang',
    category: '调整法',
    name: '把口搬走',
    items: ['调整门口位置或方向', '改变入口方位'],
    usage: '空亡宫位若为门口，可通过调整入口方向化解空亡之气',
    applicableTo: ['空亡'],
  },
  {
    id: 'fill_empty',
    category: '填实法',
    name: '空亡填实',
    items: ['子补子', '丑补丑', '以同支填实'],
    usage: '用空亡地支对应的生肖、物品、方位来填补能量',
    applicableTo: ['空亡'],
  },
  {
    id: 'liuhe',
    category: '六合法',
    name: '地支相合',
    items: ['子丑合', '寅亥合', '卯戌合', '辰酉合', '巳申合', '午未合'],
    usage: '用与空亡地支相合的地支来补救，合能解空',
    applicableTo: ['空亡'],
  },
  {
    id: 'wudi_coin_kongwang',
    category: '风水物品',
    name: '五帝钱',
    items: ['顺治、康熙、雍正、乾隆、嘉庆五枚铜钱'],
    usage: '悬挂于门口或放置于空亡方位，可补充缺失能量',
    applicableTo: ['空亡'],
  },
  {
    id: 'gourd',
    category: '风水物品',
    name: '真葫芦',
    items: ['完整天然葫芦'],
    usage: '流年空亡时，挂于进门或卧室门头上，可收纳虚气',
    applicableTo: ['空亡'],
  },
  // ===== 入墓化解方法 =====
  {
    id: 'liuchong',
    category: '六冲法',
    name: '地支相冲',
    items: ['子午冲', '丑未冲', '寅申冲', '卯酉冲', '辰戌冲', '巳亥冲'],
    usage: '用与入墓地支相冲的地支来冲开墓库，释放被困能量',
    applicableTo: ['入墓'],
  },
  {
    id: 'opposite_palace',
    category: '对宫法',
    name: '对宫符号冲',
    items: ['利用对宫能量冲开墓库'],
    usage: '本宫入墓但对宫无四害时，借对宫符号之力冲开本宫墓库',
    applicableTo: ['入墓'],
  },
  // ===== 击刑化解方法 =====
  {
    id: 'liuhe_xing',
    category: '六合法',
    name: '合解刑',
    items: ['子丑合', '寅亥合', '卯戌合', '辰酉合', '巳申合', '午未合'],
    usage: '找相合的地支化解刑克，合能解刑',
    applicableTo: ['击刑'],
  },
  {
    id: 'guiren_xing',
    category: '贵人法',
    name: '贵人解刑',
    items: ['寻找贵人相助'],
    usage: '寅巳申三刑见贵人可解，借助贵人力量化解刑害',
    applicableTo: ['击刑'],
  },
  {
    id: 'bagua_mirror',
    category: '风水物品',
    name: '凸面八卦镜',
    items: ['凸面八卦镜（反射煞气用）'],
    usage: '挂于门外或窗外，反射外来煞气，化解刑克之力，不可对内',
    applicableTo: ['击刑'],
  },
  // ===== 门迫化解方法 =====
  {
    id: 'crystal_menpo',
    category: '水晶能量',
    name: '水晶化解门迫',
    items: ['根据门的五行选择相应水晶'],
    usage: '门被宫克时，用能生门之五行的水晶来补充门的能量',
    applicableTo: ['门迫'],
  },
  {
    id: 'wait_timing',
    category: '择时法',
    name: '等待吉时',
    items: ['选择门转入相生之宫的时机'],
    usage: '门迫之时宜守成，不宜开创，等待门转入相生之宫再行动',
    applicableTo: ['门迫'],
  },
  {
    id: 'jishen_help',
    category: '借力法',
    name: '借吉神化解',
    items: ['借助其他吉神吉格'],
    usage: '借助局中其他吉神吉格的力量来化解门迫之害',
    applicableTo: ['门迫'],
  },
];

// ===== 入墓按宫位化解方法 =====
export interface PalaceRemedy {
  palace: number;
  palaceName: string;
  element: string;
  tombType: string;
  remedyMethods: {
    method: string;
    items: string[];
    usage: string;
  }[];
}

export const RU_MU_PALACE_REMEDIES: PalaceRemedy[] = [
  {
    palace: 2,
    palaceName: '坤二宫',
    element: '土',
    tombType: '木入墓（未）',
    remedyMethods: [
      { method: '六冲法', items: ['丑未相冲'], usage: '用丑（牛）冲开未墓，释放木气' },
      { method: '生肖法', items: ['牛饰品', '牛摆件'], usage: '摆放牛生肖物品于坤宫方位' },
      { method: '水生木', items: ['鱼缸', '流水摆件'], usage: '水能生木，增强木气以破墓' },
    ],
  },
  {
    palace: 4,
    palaceName: '巽四宫',
    element: '木',
    tombType: '水入墓（辰）',
    remedyMethods: [
      { method: '六冲法', items: ['戌辰相冲'], usage: '用戌（狗）冲开辰墓，释放水气' },
      { method: '生肖法', items: ['狗饰品', '狗摆件'], usage: '摆放狗生肖物品于巽宫方位' },
      { method: '金生水', items: ['金属风铃', '铜器'], usage: '金能生水，增强水气以破墓' },
    ],
  },
  {
    palace: 6,
    palaceName: '乾六宫',
    element: '金',
    tombType: '火/土入墓（戌）',
    remedyMethods: [
      { method: '六冲法', items: ['辰戌相冲'], usage: '用辰（龙）冲开戌墓，释放火/土气' },
      { method: '生肖法', items: ['龙饰品', '龙摆件'], usage: '摆放龙生肖物品于乾宫方位' },
      { method: '木生火', items: ['绿植', '木雕'], usage: '木能生火，增强火气以破墓（火入墓时）' },
    ],
  },
  {
    palace: 8,
    palaceName: '艮八宫',
    element: '土',
    tombType: '金入墓（丑）',
    remedyMethods: [
      { method: '六冲法', items: ['未丑相冲'], usage: '用未（羊）冲开丑墓，释放金气' },
      { method: '生肖法', items: ['羊饰品', '羊摆件'], usage: '摆放羊生肖物品于艮宫方位' },
      { method: '土生金', items: ['陶瓷器', '黄水晶'], usage: '土能生金，增强金气以破墓' },
    ],
  },
];

// ===== 击刑按宫位化解方法 =====
export interface XingPalaceRemedy {
  palace: number;
  palaceName: string;
  xingType: string;
  xingDescription: string;
  remedyMethods: {
    method: string;
    items: string[];
    usage: string;
  }[];
}

export const JI_XING_PALACE_REMEDIES: XingPalaceRemedy[] = [
  {
    palace: 1,
    palaceName: '坎一宫',
    xingType: '子卯刑',
    xingDescription: '子（坎宫）与卯（震宫）相刑，无礼之刑',
    remedyMethods: [
      { method: '六合法', items: ['子丑合', '卯戌合'], usage: '用丑（牛）合子，或用戌（狗）合卯，合能解刑' },
      { method: '生肖法', items: ['牛饰品或狗饰品'], usage: '摆放相合生肖物品化解刑克' },
      { method: '通关法', items: ['水生木'], usage: '子为水、卯为木，顺生则解，保持水木和谐' },
    ],
  },
  {
    palace: 3,
    palaceName: '震三宫',
    xingType: '子卯刑',
    xingDescription: '卯（震宫）与子（坎宫）相刑，无礼之刑',
    remedyMethods: [
      { method: '六合法', items: ['卯戌合', '子丑合'], usage: '用戌（狗）合卯，或用丑（牛）合子，合能解刑' },
      { method: '生肖法', items: ['狗饰品或牛饰品'], usage: '摆放相合生肖物品化解刑克' },
      { method: '通关法', items: ['木火通明'], usage: '引导木气向火发展，化解刑气' },
    ],
  },
  {
    palace: 4,
    palaceName: '巽四宫',
    xingType: '辰辰自刑',
    xingDescription: '辰见辰为自刑，自我消耗',
    remedyMethods: [
      { method: '六合法', items: ['辰酉合'], usage: '用酉（鸡）合辰，合能解自刑' },
      { method: '生肖法', items: ['鸡饰品'], usage: '摆放鸡生肖物品化解辰自刑' },
      { method: '六冲法', items: ['戌冲辰'], usage: '用戌（狗）冲辰，打破自刑循环' },
    ],
  },
  {
    palace: 6,
    palaceName: '乾六宫',
    xingType: '丑戌未三刑',
    xingDescription: '戌（乾宫）与丑未相刑，恃势之刑',
    remedyMethods: [
      { method: '六合法', items: ['戌卯合'], usage: '用卯（兔）合戌，化解刑气' },
      { method: '生肖法', items: ['兔饰品'], usage: '摆放兔生肖物品于乾宫化解' },
      { method: '凸面八卦镜', items: ['凸面八卦镜'], usage: '反射煞气，化解刑克之力' },
    ],
  },
  {
    palace: 7,
    palaceName: '兑七宫',
    xingType: '酉酉自刑',
    xingDescription: '酉见酉为自刑，自我伤害',
    remedyMethods: [
      { method: '六合法', items: ['辰酉合'], usage: '用辰（龙）合酉，化解自刑' },
      { method: '生肖法', items: ['龙饰品'], usage: '摆放龙生肖物品化解酉自刑' },
      { method: '六冲法', items: ['卯冲酉'], usage: '用卯（兔）冲酉，打破自刑循环' },
    ],
  },
  {
    palace: 8,
    palaceName: '艮八宫',
    xingType: '丑戌未三刑 / 寅巳申三刑',
    xingDescription: '丑、寅在艮宫，涉及恃势之刑与无恩之刑',
    remedyMethods: [
      { method: '六合法-丑', items: ['子丑合'], usage: '用子（鼠）合丑，化解丑的刑气' },
      { method: '六合法-寅', items: ['寅亥合'], usage: '用亥（猪）合寅，化解寅的刑气' },
      { method: '生肖法', items: ['鼠饰品', '猪饰品'], usage: '根据具体刑害类型选择生肖' },
    ],
  },
  {
    palace: 9,
    palaceName: '离九宫',
    xingType: '午午自刑',
    xingDescription: '午见午为自刑，自我煎熬',
    remedyMethods: [
      { method: '六合法', items: ['午未合'], usage: '用未（羊）合午，化解自刑' },
      { method: '生肖法', items: ['羊饰品'], usage: '摆放羊生肖物品化解午自刑' },
      { method: '六冲法', items: ['子冲午'], usage: '用子（鼠）冲午，打破自刑循环' },
    ],
  },
];

// 水晶能量物品 - 专门用于化解门迫（按宫位分类）
export interface CrystalRemedy {
  door: string;
  doorElement: string;
  generatingElement: string;
  crystal: string;
  color: string;
  usage: string;
  affectedPalaces: { palace: number; palaceName: string }[];
}

export const CRYSTAL_REMEDIES: CrystalRemedy[] = [
  { 
    door: '开门', doorElement: '金', generatingElement: '土', crystal: '黄水晶', color: '黄色', 
    usage: '土生金，黄水晶补充开门能量',
    affectedPalaces: [{ palace: 9, palaceName: '离九宫' }]
  },
  { 
    door: '休门', doorElement: '水', generatingElement: '金', crystal: '白水晶', color: '白色', 
    usage: '金生水，白水晶补充休门能量',
    affectedPalaces: [{ palace: 2, palaceName: '坤二宫' }, { palace: 8, palaceName: '艮八宫' }]
  },
  { 
    door: '生门', doorElement: '土', generatingElement: '火', crystal: '紫水晶', color: '紫色', 
    usage: '火生土，紫水晶补充生门能量',
    affectedPalaces: [{ palace: 3, palaceName: '震三宫' }]
  },
  { 
    door: '伤门', doorElement: '木', generatingElement: '水', crystal: '黑曜石', color: '黑色', 
    usage: '水生木，黑曜石补充伤门能量',
    affectedPalaces: [{ palace: 6, palaceName: '乾六宫' }, { palace: 7, palaceName: '兑七宫' }]
  },
  { 
    door: '杜门', doorElement: '木', generatingElement: '水', crystal: '黑曜石', color: '黑色', 
    usage: '水生木，黑曜石补充杜门能量',
    affectedPalaces: [{ palace: 6, palaceName: '乾六宫' }, { palace: 7, palaceName: '兑七宫' }]
  },
  { 
    door: '景门', doorElement: '火', generatingElement: '木', crystal: '绿水晶', color: '绿色', 
    usage: '木生火，绿水晶补充景门能量',
    affectedPalaces: [{ palace: 1, palaceName: '坎一宫' }]
  },
  { 
    door: '死门', doorElement: '土', generatingElement: '火', crystal: '紫水晶', color: '紫色', 
    usage: '火生土，紫水晶补充死门能量',
    affectedPalaces: [{ palace: 3, palaceName: '震三宫' }]
  },
  { 
    door: '惊门', doorElement: '金', generatingElement: '土', crystal: '黄水晶', color: '黄色', 
    usage: '土生金，黄水晶补充惊门能量',
    affectedPalaces: [{ palace: 9, palaceName: '离九宫' }]
  },
];

// 生肖原则
export const ZODIAC_REMEDY_PRINCIPLE = {
  title: '生肖原则',
  description: '生肖为本宫或宫"生"属性',
  details: [
    '如：坎宫（属水）可用金生水。例如：黑色的猪，金色的蛇',
    '如：震宫（属木）可用木的颜色。例如：青色的牛，青色的龙',
  ],
};

// ===== 四害简述 =====
export const SI_HAI_BRIEF: Record<string, string> = {
  kong_wang: '能量消失，空想，想得多',
  ru_mu: '压抑情绪，内耗',
  ji_xing: '自己和自己过不去',
  men_po: '人际关系不好，不被认可，敏感',
};

// ===== 天干受四害影响的性格特征 =====
export interface StemTraitInfo {
  stems: string[];
  element: string;
  trait: string;
  health?: string;
}

export const STEM_SI_HAI_TRAITS: StemTraitInfo[] = [
  { stems: ['甲', '乙'], element: '木', trait: '心肠软，仁爱之心过度，同情心泛滥', health: '导致肝不好' },
  { stems: ['丙', '丁'], element: '火', trait: '会做不说，对别人好，不好意思表达，愿意给别人最好的东西而不是给自己' },
  { stems: ['戊', '己'], element: '土', trait: '为别人付出，失信兑现不了承诺' },
  { stems: ['庚', '辛'], element: '金', trait: '讲情义，付出一切别人看不到' },
  { stems: ['壬', '癸'], element: '水', trait: '没有安全感（持续表达关系），有想象力', health: '养肾' },
];

// ===== 击刑详细数据（按天干/宫位） =====
export interface JiXingDetailInfo {
  stem: string;
  xunShou?: string;
  palace: number;
  palaceName: string;
  element: string;
  health: string;
  problems: string;
  specialNote?: string;
  liuHe: string;
}

export const JI_XING_DETAILS: JiXingDetailInfo[] = [
  { stem: '庚（甲申庚）', palace: 8, palaceName: '艮', element: '土', health: '肺呼吸道不舒服，睡眠差', problems: '车祸、阻碍、困难、意外、大的刑伤、病痛', specialNote: '击刑+入墓时，人为扭曲事实', liuHe: '巳' },
  { stem: '戊（甲子戊）', palace: 3, palaceName: '震', element: '木', health: '恶心反胃', problems: '破财、肿瘤、资金困难、土有关的东西', liuHe: '丑' },
  { stem: '壬癸（甲辰壬/甲寅癸）', palace: 4, palaceName: '巽', element: '木', health: '睡眠问题', problems: '迷茫、艰难、牢狱之灾、大的人生变故', liuHe: '酉（壬）/ 亥（癸）' },
  { stem: '辛（甲午辛）', palace: 9, palaceName: '离', element: '火', health: '头晕头痛', problems: '破坏、错误、破财、刀伤、牢狱、投资失误', liuHe: '申' },
  { stem: '己（甲戌己）', palace: 2, palaceName: '坤', element: '土', health: '容易内耗、睡眠有问题、精神问题', problems: '陷阱、小人、升官失败、痛苦、压力大', liuHe: '卯' },
];

// 击刑 断人/断事/断物
export const JI_XING_JUDGMENTS = {
  person: '劳累、难受、损失、离职',
  matter: '事情不顺利、麻烦多、棘手',
  object: '物品破损、残缺、不能用',
};

// ===== 门迫详细数据（按八门） =====
export interface MenPoDetailInfo {
  door: string;
  element: string;
  color: string;
  colorReason: string;
  liuHe: string;
  mainMeaning: string;
  keyIssue: string;
  menPoEffect: string;
  remedy: string;
}

export const MEN_PO_DETAILS: MenPoDetailInfo[] = [
  { door: '休门', element: '水', color: '青色', colorReason: '水生木', liuHe: '丑合子', mainMeaning: '主休息、停滞、缓和', keyIssue: '休息不好', menPoEffect: '贵人关系不持续，生生不息、创新受阻。门迫时表现为过度消极，计划难以推进，人际关系冷淡', remedy: '提高破局思维' },
  { door: '伤门', element: '木', color: '紫色', colorReason: '木生火', liuHe: '戌合卯', mainMeaning: '主伤害、争斗、损耗', keyIssue: '仁爱受阻', menPoEffect: '容易伤心、不敏感。门迫时可能冲突被压制但隐患仍在，如暗中树敌、意外受伤风险增加', remedy: '礼锐，热情度，持续' },
  { door: '杜门', element: '木', color: '紫色', colorReason: '木生火', liuHe: '申合巳', mainMeaning: '主堵塞、隐藏、阻力', keyIssue: '仁爱受阻', menPoEffect: '门迫时可能导致信息隔绝加剧，问题难以暴露，需警惕潜在危机。做事不够坚持', remedy: '礼锐，热情度，持续' },
  { door: '惊门', element: '金', color: '黑色', colorReason: '金生水', liuHe: '辰合酉', mainMeaning: '主惊恐、口舌、纠纷', keyIssue: '认知不够', menPoEffect: '没有安全感。门迫时易引发诉讼、谣言，或人际关系破裂，需谨言慎行', remedy: '提高认知' },
  { door: '景门', element: '火', color: '黄色', colorReason: '火生土', liuHe: '未合午', mainMeaning: '主信息、文书、文化、计划', keyIssue: '礼节受损', menPoEffect: '门迫时易出现文书错误、计划夭折，或名誉受损（如舆论纠纷）', remedy: '修信德，信为道源功德母，性格提升，提高气质' },
  { door: '生门', element: '土', color: '白色', colorReason: '土生金', liuHe: '亥合寅', mainMeaning: '主生机、财富、发展', keyIssue: '生死难关', menPoEffect: '门迫时易出现财运受阻、投资失利，或身体精力不足（如脾胃问题）', remedy: '修义气，原则底气' },
  { door: '死门', element: '土', color: '白色', colorReason: '土生金', liuHe: '巳合申', mainMeaning: '主终结、压抑、僵局', keyIssue: '生死难关', menPoEffect: '死门主终结和压抑，门迫时可能矛盾激化，陷入僵局，或心理压力过大（需注意情绪调节）', remedy: '修义气，原则底气' },
  { door: '开门', element: '金', color: '黑色', colorReason: '金生水', liuHe: '寅合亥', mainMeaning: '主开创、行动、机遇、开放', keyIssue: '不智慧', menPoEffect: '胆大半致亏损。门迫时可能行动受阻，机会错失，或事业进展缓慢', remedy: '修智慧，多学习' },
];

// 门迫 断人/断事/断物
export const MEN_PO_JUDGMENTS = {
  person: '不顺心如意，没安全感，敏感，渴望认可，压力大',
  matter: '人为破坏，关系危机，欠人和',
  object: '物品破坏，低质物品',
};

// 门迫 吉凶区别
export const MEN_PO_JI_XIONG = {
  ji: '吉门门迫：吉性减弱，需通过其他符号（如吉星、吉神）补救',
  xiong: '凶门门迫：凶性被部分压制，但潜在风险仍需警惕',
  remedy: '化解思路：结合天盘、地盘、神煞等综合判断，通过方位选择、时间调整或风水布局缓解门迫影响',
};

// ===== 空亡 断人/断事/断物 =====
export const KONG_WANG_JUDGMENTS = {
  person: '没信心、想放弃、不积极努力',
  matter: '徒劳无功、不实之事、结束',
  object: '空箱、空瓶、空置物品',
};

// 空亡 宫位象义
export interface KongWangPalaceMeaning {
  palace: string;
  meaning: string;
}

export const KONG_WANG_PALACE_MEANINGS: KongWangPalaceMeaning[] = [
  { palace: '命宫', meaning: '奔波劳碌，不安稳的人。去做营销，可以让其人空亡' },
  { palace: '平台宫', meaning: '事业没平台，难以有自己的事业，创业难' },
  { palace: '大运/空亡的人', meaning: '有运无气，气已走空，格局再好没有用，代表奔波劳碌' },
  { palace: '流年', meaning: '表示会换工作、换平台搬家，总之空亡他的变动就怎么样，比较大，也代表转移' },
];

// ===== 入墓 断人/断事/断物 =====
export const RU_MU_JUDGMENTS = {
  person: '能力弱、受困、边缘化',
  matter: '犹豫、时机不到、条件不成熟',
  object: '积压老旧、不用的物品',
};

// 入墓 宫位象义（按门/位置）
export interface RuMuPalaceMeaning {
  position: string;
  meaning: string;
}

export const RU_MU_PALACE_MEANINGS: RuMuPalaceMeaning[] = [
  { position: '开门', meaning: '事业受阻' },
  { position: '生门', meaning: '财运受阻' },
  { position: '大运宫位', meaning: '运没有发展' },
  { position: '命宫', meaning: '发挥不出来才华，给人感觉懒，他不知道怎样发挥，保守' },
  { position: '平台宫', meaning: '努力大，创业很累，钱和努力不成正比' },
];
