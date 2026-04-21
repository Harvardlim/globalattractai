/**
 * 八字格局数据
 * 依据传统命理学资料整理
 */

// ===== 成格/不成格特征 =====
export interface PatternEstablishedTraits {
  title: string;
  characteristics: string[];
}

// 成格的人特征 (格局纯粹、用神有力)
export const ESTABLISHED_PATTERN_TRAITS: PatternEstablishedTraits = {
  title: '成格特征',
  characteristics: [
    '格局有序：格神（月令）透出且有配合，如官逢财印、食神生财等，没有破坏',
    '人生层次高：工作或事业通常有明确的奋斗方向，容易在特定领域获得较高社会地位、名誉或财富',
    '性格坚定：意志力强，行事风格稳重，能理性应对困难，且有能力驾驭复杂局势',
    '富贵安定：原局有病有药（有克制也有解救），命运顺畅，即使格局不纯粹，若大运补足也主富贵',
  ],
};

// 不成格/破格的人特征 (五行杂乱、用神无力)
export const BROKEN_PATTERN_TRAITS: PatternEstablishedTraits = {
  title: '破格/无格特征',
  characteristics: [
    '格局杂乱：格神受刑冲合害、天敌克制，或身过弱/过强且用神缺失',
    '生活奔波：往往缺乏明确的主心骨，行事容易多阻滞，生活或工作较为忙碌奔波',
    '性格波动：性格可能较不稳定或想法杂乱，难以专注于一个方向',
    '求新求变：想做不一样的事情，更注重个人利益，渴望突破现状和改变',
    '依赖大运："破格"者需寻找另外的"局"来帮扶（如"弃食就杀印"），往往必须依靠大运的配合才能获得成就，若大运不扶，事业起伏较大',
  ],
};

// 无格局人的详细特征
export interface NoPatternCharacteristics {
  title: string;
  traits: string[];
}

export const NO_PATTERN_CHARACTERISTICS: NoPatternCharacteristics = {
  title: '无格局人的特征',
  traits: [
    '思维跳跃：想法多变，容易"三分钟热度"，难以长期坚持一件事',
    '自我中心：更关注自身利益和感受，做事先考虑对自己有何好处',
    '追求不同：不喜欢按部就班，总想做些与众不同的事情',
    '情绪化决策：容易受情绪影响做决定，事后可能后悔',
    '缺乏耐心：对于需要长期经营的事情缺乏足够耐心',
    '随波逐流：没有明确的人生规划，容易受环境和他人影响',
    '适应力强：因为没有固定模式，反而能在多变环境中灵活应对',
  ],
};

// 破格/无格局的人 - 解决方案建议
export const BROKEN_PATTERN_SOLUTIONS: string[] = [
  '明确目标：设定清晰可行的短期目标，逐步达成，避免心浮气躁',
  '踏实执行：做好手头的每一件事，用结果证明自己的价值',
  '善于倾听：多听取他人建议，做一个听话配合的人，借助团队力量成事',
  '借助贵人：寻找有格局、有资源的贵人帮扶，甘当副手也可有成就',
  '顺势而为：不强求独立成事，顺应大势，在合适的环境中发挥所长',
];

// ===== 普通格局（正格）=====
export interface NormalPatternInfo {
  name: string;           // 格局名称
  formationCondition: string; // 成格条件
  coreCharacteristics: string; // 核心特征
  modernFields: string[]; // 现代适配领域
  protectionNeeds: string[]; // 护卫需求（喜忌）
  fears: string[];        // 怕遇见什么（忌讳）
}

// 普通格局（正格）数据（按图3）
export const NORMAL_PATTERNS: Record<string, NormalPatternInfo> = {
  正官格: {
    name: '正官格',
    formationCondition: '月令透正官，无伤官破局',
    coreCharacteristics: '贵气显达，责任担当',
    modernFields: ['行政管理', '司法系统'],
    protectionNeeds: ['官怕伤', '需印护'],
    fears: ['伤官', '七杀混杂', '刑冲破害'],
  },
  七杀格: {
    name: '七杀格',
    formationCondition: '月令透七杀，有食制或印化',
    coreCharacteristics: '杀伐决断，逆境突围',
    modernFields: ['危机管理', '军事科技'],
    protectionNeeds: ['需食神制', '或印星化'],
    fears: ['无制无化', '官杀混杂', '财星生杀太旺'],
  },
  正印格: {
    name: '正印格',
    formationCondition: '月令透正印，忌财星破印',
    coreCharacteristics: '学识渊博，慈悲济世',
    modernFields: ['教育研究', '心理咨询'],
    protectionNeeds: ['印怕财', '忌财星'],
    fears: ['财星破印', '刑冲印星'],
  },
  偏印格: {
    name: '偏印格',
    formationCondition: '月令透偏印，需见财星或食神',
    coreCharacteristics: '奇才异能，孤傲钻研',
    modernFields: ['量子计算', '玄学研究'],
    protectionNeeds: ['需财或食神解'],
    fears: ['枭印夺食', '无财解救', '食神被克'],
  },
  正财格: {
    name: '正财格',
    formationCondition: '月令透正财，配官印更佳',
    coreCharacteristics: '勤俭致富，稳定守成',
    modernFields: ['财务会计', '供应链管理'],
    protectionNeeds: ['忌比劫夺', '喜官印护'],
    fears: ['比劫争财', '劫财透干', '羊刃夺财'],
  },
  偏财格: {
    name: '偏财格',
    formationCondition: '月令透偏财，需身强能任',
    coreCharacteristics: '投机获财，人脉通天',
    modernFields: ['风险投资', '娱乐产业'],
    protectionNeeds: ['需身强', '忌比劫争'],
    fears: ['比劫争财', '身弱不胜财', '劫财透干'],
  },
  食神格: {
    name: '食神格',
    formationCondition: '月令透食神，忌枭神夺食',
    coreCharacteristics: '福寿安康，艺术天赋',
    modernFields: ['美食文旅', '创意设计'],
    protectionNeeds: ['食怕枭', '忌偏印'],
    fears: ['枭神夺食', '偏印克食', '刑冲食神'],
  },
  伤官格: {
    name: '伤官格',
    formationCondition: '月令透伤官，佩印或制杀成格',
    coreCharacteristics: '才华横溢，颠覆创新',
    modernFields: ['自媒体', '专利研发'],
    protectionNeeds: ['可佩印', '或制杀'],
    fears: ['伤官见官', '无印无财', '官星透干'],
  },
  比肩格: {
    name: '比肩格',
    formationCondition: '月令透比肩，需有财官为用',
    coreCharacteristics: '独立自主，竞争意识强',
    modernFields: ['自主创业', '竞技体育'],
    protectionNeeds: ['需财官泄耗', '忌比劫过旺'],
    fears: ['无财无官', '比劫成群', '身旺无泄'],
  },
  劫财格: {
    name: '劫财格',
    formationCondition: '月令透劫财，需官杀制或食伤泄',
    coreCharacteristics: '争强好胜，敢拼敢闯，行动力强',
    modernFields: ['商业竞争', '销售管理', '投资交易'],
    protectionNeeds: ['需官杀制劫', '或食伤泄秀'],
    fears: ['劫财夺财', '无制无化', '见财起争'],
  },
  建禄格: {
    name: '建禄格',
    formationCondition: '月令见日主之禄（比肩）',
    coreCharacteristics: '自立自强，财官两用',
    modernFields: ['自主创业', '独立执业'],
    protectionNeeds: ['需有财官为用'],
    fears: ['无财无官', '比劫过旺', '身旺无泄'],
  },
  羊刃格: {
    name: '羊刃格',
    formationCondition: '月令见日主之刃（劫财）',
    coreCharacteristics: '刚强果敢，驾驭能力强',
    modernFields: ['军警武职', '手术医师'],
    protectionNeeds: ['需官杀制刃'],
    fears: ['刃无制化', '刑冲羊刃', '三合三会年运'],
  },
};

// ===== 特殊格局 =====
export interface SpecialPatternInfo {
  type: '专旺格' | '从格' | '化气格' | '禄刃格';
  name: string;           // 格局名称
  formationCondition: string; // 成立条件
  characteristics: string; // 吉凶特性
  prohibitions: string;   // 忌讳
  famousExamples: string[]; // 代表人物
  favorableGods?: string[];  // 喜用神
  unfavorableGods?: string[]; // 忌神
  fortuneAdvice?: string;    // 运势建议
}

// 禄刃格数据（建禄格、阳刃格/月刃格）
export const SPECIAL_LU_REN_PATTERNS: SpecialPatternInfo[] = [
  {
    type: '禄刃格',
    name: '建禄格',
    formationCondition: '月令见日主之禄（月支为日干的临官位）',
    characteristics: '成格，少时家境贫寒',
    prohibitions: '日主过强时忌比劫、印，大器晚成，多靠自己努力经营事业',
    famousExamples: [],
    favorableGods: ['财', '官'],
    unfavorableGods: ['比劫', '印'],
    fortuneAdvice: '身旺用财官，需有财官为用神方能取贵，若无财官则难有大成就',
  },
  {
    type: '禄刃格',
    name: '阳刃格',
    formationCondition: '月令见日主之刃（月支为日干的帝旺位），日主极强',
    characteristics: '成格，无雅气',
    // characteristics: '成格，无雅气，日主极强，喜官杀，遇官杀则贵。忌印、比劫，日主强的月刃格，逢三合三会的年份以及大运，容易出意外',
    prohibitions: '忌印、比劫；逢三合三会运年易有意外、日主极强，喜官杀，遇官杀则贵。忌印、比劫，日主强的月刃格，逢三合三会的年份以及大运，容易出意外',
    famousExamples: [],
    favorableGods: ['官', '杀'],
    unfavorableGods: ['印', '比劫'],
    fortuneAdvice: '身旺比劫多首选官杀；身旺无官可取食伤为用；身旺印多可取财为用',
  },
  {
    type: '禄刃格',
    name: '月刃格',
    formationCondition: '阴干日主，月令见劫财（阴干之刃）',
    characteristics: '与阳刃格类似',
    prohibitions: '忌印、比劫过旺，日主强旺，喜官杀制刃',
    famousExamples: [],
    favorableGods: ['官', '杀'],
    unfavorableGods: ['印', '比劫'],
    fortuneAdvice: '日主强需官杀制衡，否则刃旺无制易生祸端',
  },
];

// 专旺格数据（一行得气格）
export const SPECIAL_DOMINANT_PATTERNS: SpecialPatternInfo[] = [
  {
    type: '专旺格',
    name: '曲直格',
    formationCondition: '地支全寅卯辰，天干甲乙透',
    characteristics: '仁德济世',
    prohibitions: '忌金破局',
    famousExamples: ['董仲舒（儒学家）'],
    favorableGods: ['木', '水'],
    unfavorableGods: ['金'],
    fortuneAdvice: '专旺格忌运行官杀，主破败、凶灾、疾厄、意外、刑伤。亦忌月支逢岁运来冲克，主破财、是非、困厄、灾伤。若原命局月支逢他支来冲，反主一生多波折，多冲击、奔波、出外、多阻难',
  },
  {
    type: '专旺格',
    name: '炎上格',
    formationCondition: '地支全巳午未，天干丙丁透',
    characteristics: '光明炽烈',
    prohibitions: '忌水克破',
    famousExamples: ['诸葛亮（军事家）'],
    favorableGods: ['火', '木'],
    unfavorableGods: ['水'],
    fortuneAdvice: '专旺格忌运行官杀，主破败、凶灾、疾厄、意外、刑伤。亦忌月支逢岁运来冲克',
  },
  {
    type: '专旺格',
    name: '稼穑格',
    formationCondition: '地支全辰戌丑未，天干戊己透',
    characteristics: '厚德载物',
    prohibitions: '忌木破土',
    famousExamples: ['范蠡（商圣）'],
    favorableGods: ['土', '火'],
    unfavorableGods: ['木'],
    fortuneAdvice: '专旺格忌运行官杀，主破败、凶灾。土旺需火生扶，忌木来克制',
  },
  {
    type: '专旺格',
    name: '从革格',
    formationCondition: '地支全申酉戌，天干庚辛透',
    characteristics: '刚锐果决',
    prohibitions: '忌火克金',
    famousExamples: ['欧冶子（铸剑大师）'],
    favorableGods: ['金', '土'],
    unfavorableGods: ['火'],
    fortuneAdvice: '专旺格忌运行官杀，火为金之官杀，运逢火主凶灾',
  },
  {
    type: '专旺格',
    name: '润下格',
    formationCondition: '地支全亥子丑，天干壬癸透',
    characteristics: '智谋深远',
    prohibitions: '忌土泄水',
    famousExamples: ['李冰（水利家）'],
    favorableGods: ['水', '金'],
    unfavorableGods: ['土'],
    fortuneAdvice: '专旺格忌运行官杀，土为水之官杀，运逢土主凶灾',
  },
];

// 从格数据（从财格、从杀格、从儿格、从势格）
export const SPECIAL_FOLLOWING_PATTERNS: SpecialPatternInfo[] = [
  {
    type: '从格',
    name: '从财格',
    formationCondition: '1、日元极弱；2、财星透干，地支财要多；3、破格：见比劫或印星透干即会破格',
    characteristics: '富甲一方',
    prohibitions: '忌比劫争财、印星透干',
    famousExamples: ['李嘉诚（商人）'],
    favorableGods: ['财', '食伤'],
    unfavorableGods: ['印', '比劫'],
    fortuneAdvice: '从财格成，局中喜见食伤生财，财源滚滚。运忌行印星，比劫来生扶帮身，反主灾疾。亦忌月支逢岁运来冲克，主凶变灾厄。以及原命局月支逢他支来冲，主平生多波折，困厄，贫乏',
  },
  {
    type: '从格',
    name: '从杀格',
    formationCondition: '1、日元极弱；2、官杀须透干，地支官杀要多，或地支可以三合成官杀；3、破格：见食神或伤官即会破格；比劫印星透干即会破格',
    characteristics: '权势滔天',
    prohibitions: '忌食伤制杀、印比助身',
    famousExamples: ['张居正（改革家）'],
    favorableGods: ['杀', '财'],
    unfavorableGods: ['印', '比劫', '食伤'],
    fortuneAdvice: '从官杀格成，局中喜见财星，才能富贵全美；若不见财星，只是贵而不富，或贵多富少。运忌行印星、比劫来生扶帮身，反主灾疾',
  },
  {
    type: '从格',
    name: '从儿格',
    formationCondition: '1、日元极弱；2、食伤须透干，地支食伤要多，或地支可以三合成食伤；3、破格：见印星即会破格；官杀透干即会破格',
    characteristics: '技艺成名',
    prohibitions: '忌印星制伤、官杀透干',
    famousExamples: ['梵高（画家）'],
    favorableGods: ['食伤', '财'],
    unfavorableGods: ['印', '官'],
    fortuneAdvice: '局中喜见比劫，但比劫不可太旺过多，否则格不成立；局中定要见财星且不能被克破，从儿格才真；若局中不见财星或被克破，反不吉也，主财源困乏，多灾厄，多折难，或先成后败。运忌行印星、官杀',
  },
  {
    type: '从格',
    name: '从势格',
    formationCondition: '1、日元极弱；2、月令为财星/官杀/食伤，局中干支都是财星/官杀/食伤；3、不符合从财格，从官杀格，从儿格；4、破格：见比劫或印星透干即会破格',
    characteristics: '顺势而为，随势而贵',
    prohibitions: '忌比劫、印星生扶帮身',
    famousExamples: [],
    favorableGods: ['财', '官', '食伤'],
    unfavorableGods: ['印', '比劫'],
    fortuneAdvice: '局中最喜见食伤，以食伤决定命造贵气大小。若食伤为月支当令，或食伤数量多(至少2个)，则贵气必大；反之，若食伤不见，或食伤数量少，主富而不贵，或富多贵少。从格运势：运忌行印星，比劫来生扶帮身，反主灾疾。亦忌月支逢岁运来冲克，主凶变灾厄。以及原命局月支逢他支来冲，主平生多波折，困厄，贫乏',
  },
];

// 化气格数据
export const SPECIAL_TRANSFORMATION_PATTERNS: SpecialPatternInfo[] = [
  {
    type: '化气格',
    name: '甲己化土',
    formationCondition: '1、必须日干与月干或时干相合（合化）；2、化出的五行属性需要得月令；3、破格：如果四柱中（不看藏干）有克化出的五行属性的就破格了；4、用神：以化气属性来从',
    characteristics: '诚信稳厚',
    prohibitions: '忌木星破格（克土）',
    famousExamples: ['司马光（史学家）'],
    favorableGods: ['土', '火'],
    unfavorableGods: ['木'],
    fortuneAdvice: '化神及生化神之用神，均须透出干，方为真。化神必须纯粹专一，方为贵，若假化者须运助时方为贵。化神若杂乱不寻，所化不真，不能贵矣',
  },
  {
    type: '化气格',
    name: '乙庚化金',
    formationCondition: '乙庚合见申酉月，化神透干，无火破格',
    characteristics: '义利兼顾',
    prohibitions: '忌火星破格',
    famousExamples: [],
    favorableGods: ['金', '土'],
    unfavorableGods: ['火'],
    fortuneAdvice: '化神须纯粹专一，透干有力方为贵',
  },
  {
    type: '化气格',
    name: '丙辛化水',
    formationCondition: '丙辛合见亥子月，化神透干，无土破格',
    characteristics: '智慧流通',
    prohibitions: '忌土星破格',
    famousExamples: [],
    favorableGods: ['水', '金'],
    unfavorableGods: ['土'],
    fortuneAdvice: '化神须纯粹专一，透干有力方为贵',
  },
  {
    type: '化气格',
    name: '丁壬化木',
    formationCondition: '丁壬合见寅卯月，化神透干，无金破格',
    characteristics: '仁慈生发',
    prohibitions: '忌金星破格',
    famousExamples: [],
    favorableGods: ['木', '水'],
    unfavorableGods: ['金'],
    fortuneAdvice: '化神须纯粹专一，透干有力方为贵',
  },
  {
    type: '化气格',
    name: '戊癸化火',
    formationCondition: '戊癸合见巳午月，化神透干，无水破格',
    characteristics: '礼明向上',
    prohibitions: '忌水星破格',
    famousExamples: [],
    favorableGods: ['火', '木'],
    unfavorableGods: ['水'],
    fortuneAdvice: '化神须纯粹专一，透干有力方为贵',
  },
];

// ===== 吉神吉格与凶神凶格 =====
export interface CombinationPatternInfo {
  name: string;           // 格局名称
  combination: string;    // 组合形式
  fortune: string;        // 富贵层次/灾厄表现
  modernMapping: string;  // 现代映射/命理解法
  type: 'auspicious' | 'inauspicious'; // 吉格/凶格
  advantages?: string[];  // 优点
  disadvantages?: string[]; // 缺点
  requiredPatterns?: string[]; // 需要的格局（成格检测用）
  remedies?: string[];    // 化解方法/增运建议
}

// 吉神吉格数据（按图4）
export const AUSPICIOUS_COMBINATIONS: CombinationPatternInfo[] = [
  {
    name: '官印相生',
    combination: '正官+正印',
    fortune: '仕途显达，文治天下',
    modernMapping: '国企高管/学术权威',
    type: 'auspicious',
    requiredPatterns: ['正官格', '正印格'],
    advantages: [
      '权威与学识兼具，受人敬重',
      '处事稳重公正，有领导魄力',
      '学习能力强，善于总结提升',
      '为人正直善良，贵人运旺',
      '事业发展稳健，步步高升',
    ],
    disadvantages: [
      '过于循规蹈矩，创新不足',
      '官僚气息较重，有时显得古板',
      '决策时可能过于谨慎保守',
    ],
    remedies: [
      '【增运】多参加学术研讨、行业论坛，提升专业权威',
      '【方位】办公室宜坐北朝南，有利官运亨通',
      '【颜色】多用黑色、蓝色配饰，增强印星力量',
      '【行业】适合体制内、教育、法律等规范性行业',
      '【贵人】多结交学术界、政界人士，互相提携',
    ],
  },
  {
    name: '食神制杀',
    combination: '七杀+食神',
    fortune: '智勇双全，化煞为权',
    modernMapping: '危机公关专家/反恐指挥官',
    type: 'auspicious',
    requiredPatterns: ['七杀格', '食神格'],
    advantages: [
      '化压力为动力，逆境成长',
      '处事果断有魄力，敢作敢当',
      '善于化解危机，转危为安',
      '智谋与胆识并存，有大将风范',
      '适应力强，能驾驭复杂局面',
    ],
    disadvantages: [
      '有时过于强势，得罪人不自知',
      '容易树敌，需注意人际关系',
      '压力承受虽强但需注意身心健康',
    ],
    remedies: [
      '【养生】定期运动释放压力，练习太极或瑜伽平衡身心',
      '【饮食】多吃温和滋补食物，少吃辛辣刺激',
      '【社交】培养柔和沟通技巧，减少锋芒毕露',
      '【事业】适合竞争性行业，但需有团队支持',
      '【修养】学习情绪管理，避免冲动决策',
    ],
  },
  {
    name: '伤官佩印',
    combination: '伤官+正印',
    fortune: '文采斐然，名扬四海',
    modernMapping: '诺贝尔奖学者/文化IP创始人',
    type: 'auspicious',
    requiredPatterns: ['伤官格', '正印格'],
    advantages: [
      '才华横溢，创意无限',
      '思想深邃，有独到见解',
      '表达能力强，善于影响他人',
      '学术与艺术天赋兼具',
      '能将创意落地，实现价值',
    ],
    disadvantages: [
      '个性较为孤傲，不易亲近',
      '对他人要求过高，难以满足',
      '有时过于理想化，脱离实际',
    ],
    remedies: [
      '【创作】坚持输出作品，积累个人品牌影响力',
      '【学习】持续深造，考取更高学历或专业认证',
      '【社交】参加文化沙龙，结交志同道合者',
      '【表达】开设个人专栏、播客或频道，传播思想',
      '【心态】学会欣赏他人，保持谦逊开放',
    ],
  },
  {
    name: '财官双美',
    combination: '正财+正官',
    fortune: '富而守贵，政商通融',
    modernMapping: '政协委员/慈善基金会主席',
    type: 'auspicious',
    requiredPatterns: ['正财格', '正官格'],
    advantages: [
      '财富与地位兼得，人生赢家',
      '为人正派，口碑极佳',
      '善于经营人脉，资源整合能力强',
      '事业财运双旺，生活富足',
      '社会责任感强，乐于回馈',
    ],
    disadvantages: [
      '责任重大，压力较大',
      '应酬较多，私人时间少',
      '容易被人情所累',
    ],
    remedies: [
      '【理财】稳健投资，避免高风险项目',
      '【公益】参与慈善活动，积累福报',
      '【健康】定期体检，注意劳逸结合',
      '【家庭】预留家庭时间，平衡事业与生活',
      '【人脉】建立高质量社交圈，远离消耗型关系',
    ],
  },
  {
    name: '杀印相生',
    combination: '七杀+正印',
    fortune: '武职显贵，功勋卓著',
    modernMapping: '航天总工程师/院士',
    type: 'auspicious',
    requiredPatterns: ['七杀格', '正印格'],
    advantages: [
      '意志坚定，执行力超强',
      '学识与魄力兼备',
      '能在高压环境中保持冷静',
      '有大格局，善于把控全局',
      '权威性强，令行禁止',
    ],
    disadvantages: [
      '过于严肃，缺乏幽默感',
      '对下属要求严格，不易相处',
      '工作狂倾向，忽视家庭',
    ],
    remedies: [
      '【修身】培养业余爱好，增添生活情趣',
      '【领导】学习柔性管理，多给下属鼓励',
      '【学习】持续进修，保持知识更新',
      '【健康】注意心血管健康，定期检查',
      '【家庭】设定家庭日，增进亲子关系',
    ],
  },
  {
    name: '食神生财',
    combination: '食神+正财',
    fortune: '财源广进，衣食无忧',
    modernMapping: '餐饮企业家/投资理财达人',
    type: 'auspicious',
    requiredPatterns: ['食神格', '正财格'],
    advantages: [
      '财运亨通，赚钱轻松',
      '生活品味高，懂得享受',
      '人缘好，贵人多助',
      '心态平和，福泽绵长',
      '善于发现商机，创业成功率高',
    ],
    disadvantages: [
      '可能过于安逸，缺乏进取心',
      '容易沉迷享乐，疏于努力',
      '财来财去，需注意理财',
    ],
    remedies: [
      '【理财】制定储蓄计划，避免过度消费',
      '【事业】设定更高目标，保持进取心',
      '【健康】控制饮食，避免暴饮暴食',
      '【投资】选择稳健理财产品，分散风险',
      '【修养】学习感恩，珍惜当下福报',
    ],
  },
  {
    name: '伤官生财',
    combination: '伤官+偏财',
    fortune: '才华变现，创业致富',
    modernMapping: '自媒体大V/专利发明家',
    type: 'auspicious',
    requiredPatterns: ['伤官格', '偏财格'],
    advantages: [
      '创意变现能力强',
      '敢想敢干，敢于冒险',
      '商业嗅觉灵敏，把握机遇',
      '口才好，营销能力强',
      '财富积累速度快',
    ],
    disadvantages: [
      '财富来得快去得也快',
      '过于自信，可能忽视风险',
      '人际关系复杂，需防小人',
    ],
    remedies: [
      '【风控】每笔投资设置止损线，控制风险敞口',
      '【储蓄】收入高峰期加大储蓄比例',
      '【团队】找可信赖的合伙人互补短板',
      '【法律】重要合作签订书面协议，保护权益',
      '【修身】保持低调，避免炫富招嫉',
    ],
  },
  {
    name: '印绑护官',
    combination: '正印+正官',
    fortune: '官星受印护，仕途稳固',
    modernMapping: '政府要员/公务员系统骨干',
    type: 'auspicious',
    requiredPatterns: ['正印格', '正官格'],
    advantages: [
      '官运亨通，仕途平稳',
      '有贵人相助，逢凶化吉',
      '学历或资质护身，专业认可度高',
      '为人稳重，深得上级信任',
      '决策有依据，不易出错',
    ],
    disadvantages: [
      '过于依赖体制，独立性不足',
      '创新突破较少',
      '可能过于保守，错失机遇',
    ],
    remedies: [
      '【进修】考取更高职称或学历，增强竞争力',
      '【创新】在稳定基础上尝试新方法',
      '【人脉】维护好与上级的关系',
      '【技能】学习新技术，避免被时代淘汰',
      '【心态】适度冒险，抓住晋升机会',
    ],
  },
  {
    name: '比劫帮身',
    combination: '比肩+劫财',
    fortune: '身旺有助，合作成事',
    modernMapping: '合伙创业/团队领袖',
    type: 'auspicious',
    requiredPatterns: ['建禄格', '羊刃格'],
    advantages: [
      '身体健康，精力充沛',
      '兄弟朋友多，人脉广泛',
      '团队协作能力强',
      '抗压能力强，不易被击垮',
      '适合合伙经营，众人拾柴火焰高',
    ],
    disadvantages: [
      '容易与人争执，合作需谨慎选人',
      '财运需官杀制约才能守住',
      '个性较强，不愿妥协',
    ],
    remedies: [
      '【合伙】选择互补型合伙人，明确分工',
      '【理财】财务独立管理，避免朋友借贷',
      '【运动】通过竞技类运动释放多余能量',
      '【沟通】学习妥协与让步的艺术',
      '【边界】明确个人与他人的财务边界',
    ],
  },
  {
    name: '偏财得禄',
    combination: '偏财+建禄',
    fortune: '横财运旺，意外之财',
    modernMapping: '股票操盘手/彩票幸运儿',
    type: 'auspicious',
    requiredPatterns: ['偏财格', '建禄格'],
    advantages: [
      '偏财运强，意外收获多',
      '投资眼光独到',
      '人脉广，商机多',
      '性格豪爽，朋友乐于助力',
      '适合投机类行业',
    ],
    disadvantages: [
      '财来财去，需学会守财',
      '容易过度冒险',
      '可能因财惹祸',
    ],
    remedies: [
      '【守财】赚到钱后立即锁定部分利润',
      '【配置】资产多元化，不把鸡蛋放一个篮子',
      '【节制】设定投机金额上限，不超过总资产10%',
      '【慈善】适当捐赠，散财积福',
      '【保险】配置保障型保险，防范意外',
    ],
  },
  {
    name: '印比相助',
    combination: '正印+比肩',
    fortune: '学识助身，稳健发展',
    modernMapping: '学术研究员/技术骨干',
    type: 'auspicious',
    requiredPatterns: ['正印格', '建禄格'],
    advantages: [
      '学习能力强，专业扎实',
      '有长辈贵人提携',
      '性格稳重，做事有计划',
      '身体健康，精神状态好',
      '适合技术类或研究类工作',
    ],
    disadvantages: [
      '可能过于保守，不敢冒险',
      '社交圈子较窄',
      '商业敏感度不高',
    ],
    remedies: [
      '【拓展】主动参加行业交流活动',
      '【商业】学习基础财务和营销知识',
      '【冒险】偶尔尝试舒适区外的事情',
      '【表达】提升演讲和表达能力',
      '【变现】将专业知识转化为商业价值',
    ],
  },
  {
    name: '财印不碍',
    combination: '正财+偏印',
    fortune: '财印各得其所，富贵双全',
    modernMapping: '企业高管/专业投资人',
    type: 'auspicious',
    requiredPatterns: ['正财格', '偏印格'],
    advantages: [
      '财运与智慧兼具',
      '善于理财投资',
      '思维独特，商业眼光好',
      '能守财也能生财',
      '适合金融或科技行业',
    ],
    disadvantages: [
      '有时想法过于复杂',
      '决策时可能犹豫',
      '需平衡理性与直觉',
    ],
    remedies: [
      '【决策】设定决策时限，避免过度分析',
      '【直觉】相信第一直觉，有时简单即正确',
      '【专注】选定方向后全力以赴',
      '【复盘】定期总结投资得失',
      '【顾问】必要时咨询专业人士意见',
    ],
  },
  {
    name: '劫财制财',
    combination: '劫财+食伤+财星',
    fortune: '劫而有泄，变争为创',
    modernMapping: '创业家/销售冠军',
    type: 'auspicious',
    requiredPatterns: ['劫财格', '食神格'],
    advantages: [
      '行动力强，执行迅速',
      '敢于竞争，不惧挑战',
      '善于将精力转化为创造力',
      '社交能力强，人脉广泛',
      '适合开拓型、竞争性强的行业',
    ],
    disadvantages: [
      '容易冲动决策，需学会冷静分析',
      '有时过于激进，忽略风险',
      '与人合作时容易产生摩擦',
    ],
    remedies: [
      '【泄秀】通过创作、教学、演讲等食伤方式释放能量',
      '【规划】做事前先制定详细计划，避免冲动',
      '【运动】坚持高强度运动，消耗多余精力',
      '【选行】适合销售、运动员、竞技类行业',
      '【搭档】找稳重型搭档互补，平衡冒进倾向',
    ],
  },
  {
    name: '劫财配官',
    combination: '劫财+正官/七杀',
    fortune: '刃有制化，威权显达',
    modernMapping: '军事指挥官/企业执行长',
    type: 'auspicious',
    requiredPatterns: ['劫财格', '七杀格'],
    advantages: [
      '魄力与纪律兼具，执行力极强',
      '善于在高压环境下发挥',
      '领导力出众，能驾驭团队',
      '敢于担当，勇于承责',
      '适合需要强执行力的管理岗位',
    ],
    disadvantages: [
      '有时过于强硬，不易妥协',
      '容易与下属产生矛盾',
      '工作压力大，需注意健康',
    ],
    remedies: [
      '【制约】接受规则约束，善用制度管理',
      '【柔和】学习柔性领导力，刚柔并济',
      '【健康】高压下注意身心调适',
      '【选业】军警、纪检、企业高管等需魄力的岗位',
      '【自省】定期反思管理方式，听取下属意见',
    ],
  },
];

// 凶神凶格数据（按图4）
export const INAUSPICIOUS_COMBINATIONS: CombinationPatternInfo[] = [
  {
    name: '官杀混杂',
    combination: '正官+七杀',
    fortune: '仕途蹉跎，诉讼缠身',
    modernMapping: '需取清（合杀留官/制杀护官）',
    type: 'inauspicious',
    requiredPatterns: ['正官格', '七杀格'],
    advantages: [
      '适应力强，能在不同环境生存',
      '见多识广，阅历丰富',
      '抗压能力强，经历磨练',
    ],
    disadvantages: [
      '事业发展不稳定，起伏大',
      '容易遭遇官司是非',
      '上司关系复杂，职场压力大',
      '决策时容易犹豫不决',
      '需防小人暗算',
    ],
    remedies: [
      '【取清】选择一个主攻方向，避免多头并进',
      '【法务】重大决策前咨询法律意见，避免纠纷',
      '【低调】行事谨慎，不要锋芒毕露',
      '【贵人】寻找有力靠山，借势发展',
      '【修心】学习冥想静心，减少内心冲突',
      '【方位】办公室避开正西方，减少官非',
    ],
  },
  {
    name: '伤官见官',
    combination: '伤官+正官',
    fortune: '牢狱是非，事业崩坏',
    modernMapping: '佩印通关或财星转化',
    type: 'inauspicious',
    requiredPatterns: ['伤官格', '正官格'],
    advantages: [
      '敢于挑战权威，有反叛精神',
      '思维活跃，不拘一格',
      '创意丰富，有艺术天赋',
    ],
    disadvantages: [
      '口舌是非多，容易得罪人',
      '与上司关系紧张，仕途受阻',
      '做事冲动，不计后果',
      '容易卷入官司诉讼',
      '婚姻感情易有波折',
    ],
    remedies: [
      '【佩印】多读书学习，增强印星力量化解冲突',
      '【转化】将创意转化为财富，用财生官',
      '【慎言】话到嘴边留半句，三思而后言',
      '【自由】选择自由职业或创业，避免体制内工作',
      '【艺术】将能量投入艺术创作，变破坏为建设',
      '【修养】学习情绪管理和沟通技巧',
    ],
  },
  {
    name: '枭神夺食',
    combination: '偏印+食神',
    fortune: '疾病抑郁，财源断绝',
    modernMapping: '用财星制枭或比劫抗枭',
    type: 'inauspicious',
    requiredPatterns: ['偏印格', '食神格'],
    advantages: [
      '思想深邃，有哲学头脑',
      '直觉敏锐，洞察力强',
      '不随波逐流，独立思考',
    ],
    disadvantages: [
      '财运不稳，收入时断时续',
      '身体健康容易出问题',
      '性格孤僻，人际关系差',
      '情绪不稳定，易有抑郁倾向',
      '做事虎头蛇尾，难以持久',
    ],
    remedies: [
      '【求财】积极开拓收入来源，用财制枭',
      '【社交】主动扩大社交圈，多与朋友互动',
      '【运动】坚持有氧运动，改善情绪状态',
      '【饮食】规律饮食，注意肠胃健康',
      '【心理】必要时寻求心理咨询帮助',
      '【坚持】选定目标后坚持到底，克服半途而废',
    ],
  },
  {
    name: '群比夺财',
    combination: '比肩+劫财',
    fortune: '破财耗散，兄弟反目',
    modernMapping: '官杀制比或食伤泄劫',
    type: 'inauspicious',
    requiredPatterns: ['建禄格', '羊刃格'],
    advantages: [
      '朋友多，社交能力强',
      '有团队精神，善于合作',
      '身体健康，精力充沛',
    ],
    disadvantages: [
      '破财风险高，难以守财',
      '朋友借钱不还，人情债多',
      '兄弟姐妹间易有矛盾',
      '合作投资容易被骗',
      '竞争对手多，压力大',
    ],
    remedies: [
      '【独立】财务独立管理，不与人合伙理财',
      '【拒绝】学会拒绝借钱请求，设立原则',
      '【泄劫】通过创作、教学等方式泄掉多余能量',
      '【保险】配置充足保险，防范意外损失',
      '【边界】明确与亲友的财务边界',
      '【慈善】适度捐赠，主动散财积福',
    ],
  },
  {
    name: '财多身弱',
    combination: '正财+偏财',
    fortune: '财大压身，劳而无获',
    modernMapping: '需印比帮身或减少贪念',
    type: 'inauspicious',
    requiredPatterns: ['正财格', '偏财格'],
    advantages: [
      '财运机会多，赚钱门路广',
      '善于发现商机',
      '有理财意识',
    ],
    disadvantages: [
      '身体容易疲劳，健康欠佳',
      '钱财虽多但难以真正拥有',
      '容易被财务问题困扰',
      '婚姻中可能因财生变',
      '劳心劳力，付出与回报不成正比',
    ],
    remedies: [
      '【养生】优先照顾身体，健康是第一财富',
      '【知足】减少贪念，量力而行',
      '【学习】多读书进修，增强印星帮身',
      '【团队】找可靠助手分担工作压力',
      '【休息】保证充足睡眠，避免过度劳累',
      '【选择】专注少数高质量机会，而非广撒网',
    ],
  },
  {
    name: '印重身轻',
    combination: '正印+偏印',
    fortune: '思多行少，学无所用',
    modernMapping: '需财星制印或食伤泄秀',
    type: 'inauspicious',
    requiredPatterns: ['正印格', '偏印格'],
    advantages: [
      '学识渊博，涉猎广泛',
      '思维缜密，考虑周全',
      '有长辈缘，贵人运不错',
    ],
    disadvantages: [
      '想太多做太少，行动力差',
      '学历高但实战经验不足',
      '过于依赖他人，独立性差',
      '容易错失良机',
      '可能眼高手低',
    ],
    remedies: [
      '【行动】设定每日必完成的小目标，培养执行力',
      '【实践】将知识应用于实际项目，积累经验',
      '【求财】主动开拓财源，用财制印',
      '【创作】通过写作、教学输出知识，泄秀成才',
      '【独立】减少对他人的依赖，自己做决定',
      '【期限】给自己设定决策时限，避免拖延',
    ],
  },
  {
    name: '食伤太旺',
    combination: '食神+伤官',
    fortune: '泄身太过，体弱多病',
    modernMapping: '需印星制伤或比劫帮身',
    type: 'inauspicious',
    requiredPatterns: ['食神格', '伤官格'],
    advantages: [
      '才华出众，创意无限',
      '表达能力强，艺术天赋高',
      '思想自由，不受约束',
    ],
    disadvantages: [
      '精力消耗过大，身体虚弱',
      '想法太多，难以专注',
      '容易半途而废',
      '与领导关系紧张',
      '财运不稳，收入起伏大',
    ],
    remedies: [
      '【养生】注重身体保养，补充营养',
      '【聚焦】选择一两个领域深耕，避免精力分散',
      '【学习】多读书思考，增强印星制伤',
      '【合作】找比肩类合伙人互补能量',
      '【作息】保持规律作息，避免熬夜透支',
      '【变现】将创意及时转化为收入，勿空想',
    ],
  },
  {
    name: '财坏印绶',
    combination: '偏财+正印',
    fortune: '财印相克，学业或事业受阻',
    modernMapping: '财印分开或用官星通关',
    type: 'inauspicious',
    requiredPatterns: ['偏财格', '正印格'],
    advantages: [
      '有赚钱能力也有学习能力',
      '适应性强，能文能武',
      '人际关系广泛',
    ],
    disadvantages: [
      '学业与事业难以兼顾',
      '容易因财务问题影响学业或资质',
      '内心矛盾，难以抉择',
      '贵人运受损',
      '需在财富与学识间做选择',
    ],
    remedies: [
      '【分离】财务工作与学习进修分开时间段进行',
      '【通关】寻找能同时满足两方面的职业方向',
      '【优先】根据人生阶段确定优先级，阶段性聚焦',
      '【贵人】多结交学术界和商界双栖人士',
      '【平衡】制定学习与赚钱的平衡计划表',
      '【考证】取得专业资质后再谋求财富增长',
    ],
  },
  {
    name: '杀重无制',
    combination: '七杀+偏印',
    fortune: '压力山大，身心俱疲',
    modernMapping: '需食神制杀或印星化杀',
    type: 'inauspicious',
    requiredPatterns: ['七杀格', '偏印格'],
    advantages: [
      '意志力强，能承受压力',
      '危机意识强，有防范心理',
      '适应逆境，越挫越勇',
    ],
    disadvantages: [
      '压力过大，容易焦虑',
      '人际关系紧张，小人多',
      '事业起伏大，难以稳定',
      '健康问题需要关注',
      '容易与人发生冲突',
    ],
    remedies: [
      '【食神】培养才艺技能，用食神制杀',
      '【运动】通过运动释放压力和负面情绪',
      '【冥想】学习冥想或正念减压',
      '【选择】远离高压环境，选择相对轻松的工作',
      '【支持】建立强大的社会支持系统',
      '【体检】定期全面体检，关注身心健康',
    ],
  },
  {
    name: '劫财透干',
    combination: '劫财+偏财',
    fortune: '破财败家，争夺不休',
    modernMapping: '需官杀制劫或远离赌博投机',
    type: 'inauspicious',
    requiredPatterns: ['羊刃格', '偏财格'],
    advantages: [
      '胆子大，敢于冒险',
      '行动力强，执行迅速',
      '有竞争意识',
    ],
    disadvantages: [
      '破财风险极高',
      '容易因贪婪而失败',
      '朋友或合伙人可能背叛',
      '婚姻感情易有第三者',
      '需远离赌博和高风险投资',
    ],
    remedies: [
      '【戒赌】绝对远离赌博和高风险投机',
      '【规则】严格执行理财纪律，设置止损线',
      '【独立】避免与人合伙投资，独立理财',
      '【官杀】找有约束力的工作或合作伙伴',
      '【保险】配置保障型产品，锁定部分资产',
      '【慈善】主动散财做公益，化解劫财凶性',
    ],
  },
  {
    name: '劫财夺财',
    combination: '劫财+正财',
    fortune: '争夺不休，财来财去',
    modernMapping: '需官杀制劫或食伤泄劫生财',
    type: 'inauspicious',
    requiredPatterns: ['劫财格', '正财格'],
    advantages: [
      '行动力强，赚钱欲望旺盛',
      '敢于竞争，不甘落后',
      '有魄力，敢于冒险',
    ],
    disadvantages: [
      '正财难守，辛苦赚来的钱容易流失',
      '与合伙人或朋友因财生怨',
      '婚姻中容易因金钱产生矛盾',
      '投资容易失败，不适合投机',
      '容易冲动消费，月光族',
    ],
    remedies: [
      '【守财】设立自动储蓄计划，先存后花',
      '【官杀】从事有纪律约束的行业，借外力制劫',
      '【独立】避免与朋友合伙做生意',
      '【泄劫】通过创作、技术输出转化竞争能量',
      '【预算】严格执行月度预算，控制非必要支出',
      '【婚姻】婚前做好财务规划，避免因财生变',
    ],
  },
  {
    name: '劫财无制',
    combination: '劫财+比肩（无官杀制）',
    fortune: '身旺无依，破耗连连',
    modernMapping: '需寻求官杀制约或食伤泄秀',
    type: 'inauspicious',
    requiredPatterns: ['劫财格', '建禄格'],
    advantages: [
      '精力旺盛，身体强健',
      '社交能力强，朋友多',
      '不怕困难，抗压力强',
    ],
    disadvantages: [
      '无法聚财，赚多花多',
      '好胜心太强，容易树敌',
      '人际关系中容易强势霸道',
      '缺乏方向感，能量无处释放',
      '容易与兄弟姐妹或朋友反目',
    ],
    remedies: [
      '【纪律】给自己设定规则和目标，借"官杀"力量',
      '【泄秀】学习技艺或创业，用食伤泄掉旺气',
      '【运动】通过竞技体育释放过剩精力',
      '【慈善】主动布施行善，化解争斗之气',
      '【自律】培养自律习惯，弥补外部约束不足',
      '【方向】找到人生目标，将能量集中于一处',
    ],
  },
];

// ===== 工具函数 =====

/**
 * 根据格局名称获取普通格局信息
 */
export const getNormalPatternInfo = (patternName: string): NormalPatternInfo | null => {
  return NORMAL_PATTERNS[patternName] || null;
};

/**
 * 获取所有专旺格信息
 */
export const getAllDominantPatterns = (): SpecialPatternInfo[] => {
  return SPECIAL_DOMINANT_PATTERNS;
};

/**
 * 获取所有从格信息
 */
export const getAllFollowingPatterns = (): SpecialPatternInfo[] => {
  return SPECIAL_FOLLOWING_PATTERNS;
};

/**
 * 获取所有化气格信息
 */
export const getAllTransformationPatterns = (): SpecialPatternInfo[] => {
  return SPECIAL_TRANSFORMATION_PATTERNS;
};

/**
 * 获取所有吉格组合
 */
export const getAllAuspiciousCombinations = (): CombinationPatternInfo[] => {
  return AUSPICIOUS_COMBINATIONS;
};

/**
 * 获取所有凶格组合
 */
export const getAllInauspiciousCombinations = (): CombinationPatternInfo[] => {
  return INAUSPICIOUS_COMBINATIONS;
};

/**
 * 根据名称查找吉格凶格
 */
export const findCombinationPattern = (name: string): CombinationPatternInfo | null => {
  const allCombinations = [...AUSPICIOUS_COMBINATIONS, ...INAUSPICIOUS_COMBINATIONS];
  return allCombinations.find(p => p.name === name) || null;
};
