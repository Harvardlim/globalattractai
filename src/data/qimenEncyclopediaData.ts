// 奇门全书数据 - 基于《御定奇门宝鉴》

// ===== 九宫（宫位）接口 =====
export interface PalaceInfo {
  id: number;
  name: string;
  bagua: string;
  element: string;
  direction: string;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
  meaning: {
    core: string;
    keywords: string[];
  };
  people: {
    family: string[];
    social: string[];
  };
  bodyParts: string[];
  industries: string[];
  objects: string[];
  timing: string;
  advice: string;
}

// ===== 九宫数据 =====
export const NINE_PALACES: PalaceInfo[] = [
  {
    id: 1,
    name: '一宫',
    bagua: '坎',
    element: '水',
    direction: '正北',
    nature: 'neutral',
    meaning: {
      core: '坎为水，代表险陷、智慧、隐藏。水主智，善于谋略，但也主险难。',
      keywords: ['智慧', '险难', '隐藏', '流动', '陷阱', '谋略'],
    },
    people: {
      family: ['中男', '次子'],
      social: ['渔民', '水手', '间谍', '侦探', '酒业者', '洗浴业者'],
    },
    bodyParts: ['肾脏', '膀胱', '耳朵', '血液', '泌尿系统', '生殖系统'],
    industries: ['水利', '航运', '酒业', '饮料', '洗浴', '养殖', '物流运输', '谍报情报'],
    objects: ['水', '酒', '墨汁', '盐', '冰', '带轮之物', '弓弧之物'],
    timing: '农历十一月（子月），每日子时（23:00-01:00）',
    advice: '坎宫主险，做事需要智慧谋略，步步为营，切勿冒进。水能载舟亦能覆舟。',
  },
  {
    id: 2,
    name: '二宫',
    bagua: '坤',
    element: '土',
    direction: '西南',
    nature: 'neutral',
    meaning: {
      core: '坤为地，代表柔顺、包容、承载。地德厚载，母性象征。',
      keywords: ['包容', '柔顺', '承载', '厚德', '生育', '务实'],
    },
    people: {
      family: ['母亲', '老母', '妻子', '女主人'],
      social: ['农民', '土地业者', '保姆', '护工', '后勤人员', '房产商'],
    },
    bodyParts: ['脾胃', '腹部', '肌肉', '皮肤', '消化系统'],
    industries: ['农业', '房地产', '建筑', '陶瓷', '纺织', '仓储', '养老', '殡葬'],
    objects: ['土', '布帛', '五谷', '釜', '方形之物', '柔软之物', '陶器'],
    timing: '农历六月（未月）、七月（申月），每日未时（13:00-15:00）',
    advice: '坤宫主柔，以柔克刚，厚德载物。行事宜稳重踏实，不宜急躁冒进。',
  },
  {
    id: 3,
    name: '三宫',
    bagua: '震',
    element: '木',
    direction: '正东',
    nature: 'auspicious',
    meaning: {
      core: '震为雷，代表动力、惊动、开创。雷动万物，春生之象。',
      keywords: ['行动', '惊动', '开创', '震动', '新生', '急速'],
    },
    people: {
      family: ['长男', '大儿子'],
      social: ['军人', '警察', '运动员', '飞行员', '驾驶员', '鼓手'],
    },
    bodyParts: ['肝脏', '胆', '足', '筋', '神经', '声带'],
    industries: ['军事', '体育', '交通', '航空', '声乐', '音响', '快递', '电子'],
    objects: ['木', '竹', '花草', '鼓', '乐器', '蔬菜', '鞭炮', '电器'],
    timing: '农历二月（卯月），每日卯时（05:00-07:00）',
    advice: '震宫主动，适合开创新事业，但要注意控制冲动，有勇有谋方成大事。',
  },
  {
    id: 4,
    name: '四宫',
    bagua: '巽',
    element: '木',
    direction: '东南',
    nature: 'auspicious',
    meaning: {
      core: '巽为风，代表进入、柔顺、传播。风行天下，无孔不入。',
      keywords: ['流通', '进入', '柔顺', '传播', '交易', '变化'],
    },
    people: {
      family: ['长女', '大女儿'],
      social: ['商人', '工匠', '教师', '传教士', '媒体人', '快递员'],
    },
    bodyParts: ['胆', '股', '毛发', '呼吸系统', '肠道', '大腿'],
    industries: ['贸易', '物流', '传媒', '通讯', '教育', '木材', '香料', '航空'],
    objects: ['木', '绳', '长条之物', '扇子', '气球', '羽毛', '纸张', '飘带'],
    timing: '农历三月（辰月）、四月（巳月），每日辰时（07:00-09:00）',
    advice: '巽宫主入，适合谈判交涉，商业贸易。顺风而行，因势利导。',
  },
  {
    id: 5,
    name: '五宫',
    bagua: '中宫',
    element: '土',
    direction: '中央',
    nature: 'neutral',
    meaning: {
      core: '中宫为太极，代表核心、枢纽、平衡。居中调和，统领八方。',
      keywords: ['核心', '枢纽', '平衡', '中心', '调和', '控制'],
    },
    people: {
      family: ['家长', '核心人物'],
      social: ['首领', '统帅', '协调者', '中介人', '枢纽管理者'],
    },
    bodyParts: ['脾胃', '心脏', '腹部中央'],
    industries: ['管理', '协调', '中介', '平台运营', '调度中心', '总部'],
    objects: ['黄色之物', '方形之物', '中心之物', '核心设备'],
    timing: '四季之交（每季最后18天），各时辰之中',
    advice: '中宫为枢，居中而不动，以静制动。做事需把握核心，统筹全局。',
  },
  {
    id: 6,
    name: '六宫',
    bagua: '乾',
    element: '金',
    direction: '西北',
    nature: 'auspicious',
    meaning: {
      core: '乾为天，代表刚健、领导、尊贵。天行健，君子以自强不息。',
      keywords: ['领导', '权威', '尊贵', '刚健', '自强', '开拓'],
    },
    people: {
      family: ['父亲', '老父', '家主', '男主人'],
      social: ['君王', '官员', '领导', '老板', '名人', '权贵', '法官'],
    },
    bodyParts: ['头', '肺', '骨骼', '大肠', '脊椎', '右腿'],
    industries: ['政府', '军事', '珠宝', '钟表', '高端制造', '金融', '航天'],
    objects: ['金', '玉', '宝石', '钟表', '镜子', '圆形之物', '金属制品'],
    timing: '农历九月（戌月）、十月（亥月），每日戌时（19:00-21:00）',
    advice: '乾宫主尊，适合领导决策，开拓事业。刚健自强，但要注意谦逊。',
  },
  {
    id: 7,
    name: '七宫',
    bagua: '兑',
    element: '金',
    direction: '正西',
    nature: 'neutral',
    meaning: {
      core: '兑为泽，代表喜悦、口舌、毁折。兑悦万物，但也主缺损。',
      keywords: ['喜悦', '口才', '交流', '缺损', '金钱', '少女'],
    },
    people: {
      family: ['少女', '小女儿', '妾'],
      social: ['歌手', '演员', '律师', '讲师', '销售', '巫师', '妓女'],
    },
    bodyParts: ['口', '舌', '牙齿', '肺', '右肋', '咽喉'],
    industries: ['演艺', '餐饮', '口腔科', '金融', '珠宝', '歌舞', '娱乐', '法律'],
    objects: ['金', '刀剪', '乐器', '杯盘', '有口之物', '缺损之物', '货币'],
    timing: '农历八月（酉月），每日酉时（17:00-19:00）',
    advice: '兑宫主说，适合交涉谈判，演讲销售。言多必失，慎言为上。',
  },
  {
    id: 8,
    name: '八宫',
    bagua: '艮',
    element: '土',
    direction: '东北',
    nature: 'neutral',
    meaning: {
      core: '艮为山，代表止步、阻隔、稳重。山止万物，静止不动。',
      keywords: ['止步', '阻隔', '稳重', '守护', '结束', '积蓄'],
    },
    people: {
      family: ['少男', '小儿子'],
      social: ['僧道', '看门人', '保安', '矿工', '建筑师', '考古学家'],
    },
    bodyParts: ['手指', '背部', '鼻子', '骨骼', '关节', '脊椎'],
    industries: ['建筑', '采矿', '寺庙', '仓储', '保安', '银行', '档案', '文物'],
    objects: ['石', '山', '门', '路', '墙', '阶梯', '钥匙', '狗'],
    timing: '农历十二月（丑月）、正月（寅月），每日丑时（01:00-03:00）',
    advice: '艮宫主止，适合守成积蓄，静观其变。知止而后有定，定而后能虑。',
  },
  {
    id: 9,
    name: '九宫',
    bagua: '离',
    element: '火',
    direction: '正南',
    nature: 'auspicious',
    meaning: {
      core: '离为火，代表光明、文明、附着。火照万物，明察秋毫。',
      keywords: ['光明', '文明', '美丽', '附着', '热情', '显现'],
    },
    people: {
      family: ['中女', '次女'],
      social: ['文人', '画家', '医生', '眼科医生', '美容师', '消防员'],
    },
    bodyParts: ['眼睛', '心脏', '血液', '小肠', '头面'],
    industries: ['文化', '传媒', '艺术', '医疗', '美容', '照明', '消防', '电子'],
    objects: ['火', '文书', '书画', '电器', '红色之物', '漂亮之物', '眼镜'],
    timing: '农历五月（午月），每日午时（11:00-13:00）',
    advice: '离宫主明，适合文化艺术，追求名声。光明正大，但要防虚荣心。',
  },
];

// ===== 六爻接口 =====
export interface LiuYaoInfo {
  id: number;
  name: string;
  title: string;
  traits: string;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
  keywords: string[];
  yijing: {
    position: string;
    symbolism: string;
    classic: string;
  };
  personality: {
    overview: string;
    decisionMaking: string;
    workStyle: string;
    relationships: string;
    strengths: string[];
    weaknesses: string[];
  };
  cooperation: {
    partner: number;
    advice: string;
  };
  governance: {
    governs: number;      // 治谁
    governedBy: number;   // 被谁治
  };
}

// ===== 六爻数据 =====
export const LIU_YAO_DATA: LiuYaoInfo[] = [
  {
    id: 1,
    name: '一爻',
    title: '平民',
    traits: '善良、简单、低调',
    nature: 'neutral',
    keywords: ['踏实', '老实干活', '实在', '执行力强', '基层', '务实'],
    yijing: {
      position: '初爻为卦之始，位居最下，象征事物的萌芽阶段。如潜龙勿用，宜韬光养晦。',
      symbolism: '代表草根、基层、起步阶段。如同种子刚入土，需扎根蓄力，不宜妄动。',
      classic: '《易·乾》：初九，潜龙勿用。象曰：潜龙勿用，阳在下也。',
    },
    personality: {
      overview: '一爻之人朴实无华，脚踏实地，不好高骛远。性格温和善良，待人真诚，不喜张扬。',
      decisionMaking: '做决定时偏向保守稳妥，不冒险，喜欢选择安全可靠的方案。遇事先观望，不急于表态。',
      workStyle: '工作踏实认真，执行力强，善于完成具体任务。不喜欢出风头，默默付出。',
      relationships: '待人和善，容易相处，但不善于主动社交。重视家庭和身边的人。',
      strengths: ['务实可靠', '执行力强', '不浮躁', '善于倾听', '脚踏实地'],
      weaknesses: ['缺乏野心', '容易满足', '不善争取', '格局较小', '过于保守'],
    },
    cooperation: {
      partner: 4,
      advice: '宜与四爻（宰相）之人合作，四爻善于规划，一爻善于执行，配合默契',
    },
    governance: {
      governs: 6,      // 一爻治六爻
      governedBy: 2,   // 被二爻治
    },
  },
  {
    id: 2,
    name: '二爻',
    title: '商贾',
    traits: '有钱、聪明、商务',
    nature: 'auspicious',
    keywords: ['看中钱', '理性', '有管理能力', '懂用人', '格局还可以', '商业头脑'],
    yijing: {
      position: '二爻居下卦之中，得中位，象征内卦的核心。虽不在高位，却是实干家。',
      symbolism: '代表中层管理、商贾阶层。与五爻相应，能获得上层的赏识与支持。',
      classic: '《易·乾》：九二，见龙在田，利见大人。象曰：见龙在田，德施普也。',
    },
    personality: {
      overview: '二爻之人头脑灵活，善于经营，有商业头脑。精明能干，懂得利益权衡。',
      decisionMaking: '做决定时会仔细计算得失，权衡利弊。善于抓住机会，但也会规避风险。',
      workStyle: '工作讲究效率和回报，善于整合资源。喜欢有挑战性和收益的项目。',
      relationships: '人脉广泛，善于社交应酬。但交往中会考虑价值和利益。',
      strengths: ['商业敏锐', '善于谈判', '灵活变通', '积累财富', '善于用人'],
      weaknesses: ['过于功利', '重利轻义', '有时短视', '信任度低', '过于算计'],
    },
    cooperation: {
      partner: 5,
      advice: '宜与五爻（帝王）之人合作，五爻做战略决策，二爻落地执行变现',
    },
    governance: {
      governs: 1,      // 二爻治一爻
      governedBy: 3,   // 被三爻治
    },
  },
  {
    id: 3,
    name: '三爻',
    title: '润滑剂',
    traits: '灵活、情商高',
    nature: 'neutral',
    keywords: ['可上可下', '灵活', '有智商情商', '人际关系好', '接受度高', '协调者'],
    yijing: {
      position: '三爻居下卦之上，处于内外交界，为「多凶」之位。需谨慎行事，如临深渊。',
      symbolism: '代表过渡阶段，既要守住根基，又要向上突破。如庙宇承上启下，连接人神。',
      classic: '《易·乾》：九三，君子终日乾乾，夕惕若厉，无咎。象曰：终日乾乾，反复道也。',
    },
    personality: {
      overview: '三爻之人可上可下，灵活变通。有智商情商，人际关系处理得好，是团队中的润滑剂。',
      decisionMaking: '做决定时会考虑各方感受，善于权衡。接受度高，能适应不同环境和要求。',
      workStyle: '工作中善于协调沟通，能在不同层级之间游刃有余。适合做中间桥梁角色。',
      relationships: '人际关系好，接受度高，善于化解矛盾。是很好的调解者和沟通者。',
      strengths: ['灵活变通', '情商高', '人缘好', '适应力强', '善于调和'],
      weaknesses: ['立场不坚定', '容易左右摇摆', '有时两面讨好', '缺乏主见', '过于圆滑'],
    },
    cooperation: {
      partner: 6,
      advice: '宜与六爻（神仙）之人合作，六爻提供灵感创意，三爻负责落地和沟通',
    },
    governance: {
      governs: 2,      // 三爻治二爻
      governedBy: 4,   // 被四爻治
    },
  },
  {
    id: 4,
    name: '四爻',
    title: '宰相',
    traits: '规划、管理',
    nature: 'auspicious',
    keywords: ['中高层管理', '规划能力强', '工作具体规划', '执行落地', '专业深入'],
    yijing: {
      position: '四爻居上卦之下，近君之位，为大臣、宰辅。承上启下，需谨慎处世。',
      symbolism: '代表近君之臣、高级幕僚。与初爻相应，能得草根支持，但需小心伴君如伴虎。',
      classic: '《易·乾》：九四，或跃在渊，无咎。象曰：或跃在渊，进无咎也。',
    },
    personality: {
      overview: '四爻之人是中高层管理者的料，善于规划，能把战略落地为具体的工作计划。',
      decisionMaking: '做决定时既考虑理想目标，也注重可行性。善于制定计划和方案。',
      workStyle: '工作专业深入，善于钻研。喜欢系统性地解决问题，注重细节和流程。',
      relationships: '善于协调各方，是很好的中间人。懂得如何与上下级相处。',
      strengths: ['规划能力强', '善于执行', '细节到位', '协调能力强', '专业可靠'],
      weaknesses: ['有时过于谨慎', '不够果断', '容易焦虑', '追求完美', '缺乏魄力'],
    },
    cooperation: {
      partner: 1,
      advice: '宜与一爻（平民）之人合作，四爻做规划，一爻做执行，相辅相成',
    },
    governance: {
      governs: 3,      // 四爻治三爻
      governedBy: 5,   // 被五爻治
    },
  },
  {
    id: 5,
    name: '五爻',
    title: '帝王',
    traits: '决策、战略',
    nature: 'auspicious',
    keywords: ['有决策能力', '选择方向', '老板思维', '做战略', '期望高', '格局大'],
    yijing: {
      position: '五爻居上卦之中，为「君位」、「尊位」，是全卦最尊贵的位置。得中得正，大吉。',
      symbolism: '代表君王、领袖、决策核心。与二爻相应，能获得贤臣辅佐，建功立业。',
      classic: '《易·乾》：九五，飞龙在天，利见大人。象曰：飞龙在天，大人造也。',
    },
    personality: {
      overview: '五爻之人有一定的决策和管理能力，善于选择方向。有老板思维，做战略规划，会考虑5-10年要做什么。',
      decisionMaking: '做决定时着眼大局，不拘小节。敢于拍板，有魄力承担责任。善于做选择题。',
      workStyle: '喜欢掌控全局，善于调动资源和人才。不喜欢做具体执行的事务，更关注战略方向。',
      relationships: '有威严感，让人敬畏。但有时显得高高在上，不够亲近。',
      strengths: ['战略眼光', '决策力强', '格局大', '敢于担当', '统筹全局'],
      weaknesses: ['容易傲慢', '不接地气', '独断专行', '难以亲近', '好高骛远'],
    },
    cooperation: {
      partner: 2,
      advice: '宜与二爻（商贾）之人合作，五爻定战略方向，二爻负责经营变现',
    },
    governance: {
      governs: 4,      // 五爻治四爻
      governedBy: 6,   // 被六爻治
    },
  },
  {
    id: 6,
    name: '六爻',
    title: '神仙',
    traits: '灵性、精神',
    nature: 'neutral',
    keywords: ['精神世界', '灵性', '有自己的想法', '用感觉做事', '创意丰富', '安静'],
    yijing: {
      position: '上爻为卦之极，位居最上，象征事物的终结与极致。物极必反，需知进退。',
      symbolism: '代表超脱者、隐士、精神导师。已过巅峰，宜退居幕后，传道授业。',
      classic: '《易·乾》：上九，亢龙有悔。象曰：亢龙有悔，盈不可久也。',
    },
    personality: {
      overview: '六爻之人活在精神世界，有灵性，有自己的想法。用自己的感觉做事，可以把信息发展开。六爻多的人，活在自己的世界，比较安静。',
      decisionMaking: '做决定时凭直觉和感应，不完全依赖逻辑分析。有时决策让人费解。',
      workStyle: '不喜欢繁琐的日常事务，偏好创意性、艺术性的工作。需要自由空间。',
      relationships: '待人慈悲包容，不计较。但有时过于超脱，让人觉得不够务实。',
      strengths: ['洞察力强', '直觉敏锐', '创意丰富', '精神境界高', '思想深邃'],
      weaknesses: ['不接地气', '过于理想化', '沉默寡言', '难以捉摸', '脱离现实'],
    },
    cooperation: {
      partner: 3,
      advice: '宜与三爻（润滑剂）之人合作，六爻出创意想法，三爻负责沟通落地',
    },
    governance: {
      governs: 5,      // 六爻治五爻
      governedBy: 1,   // 被一爻治
    },
  },
];

export interface QimenSymbolInfo {
  id: string;
  name: string;
  alias?: string;
  type: 'gate' | 'star' | 'god' | 'stem';
  nature: 'auspicious' | 'inauspicious' | 'neutral';
  element?: string;
  direction?: string;
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
  };
  health: {
    bodyParts: string[];
    risks: string[];
    advice: string;
  };
  lifePath: {
    career: string[];
    direction: string;
    advice: string;
  };
  communication: {
    style: string;
    strengths: string[];
    weaknesses: string[];
    advice: string;
  };
}

// ===== 八门 =====
export const EIGHT_GATES: QimenSymbolInfo[] = [
  {
    id: 'xiu',
    name: '休门',
    type: 'gate',
    nature: 'auspicious',
    element: '水',
    direction: '正北',
    personality: {
      traits: ['温和内敛', '善于休养', '思虑周密', '稳重沉着'],
      strengths: ['善于调节情绪', '懂得休息养生', '处事不急躁', '有耐心'],
      weaknesses: ['过于保守', '缺乏冲劲', '容易懈怠', '行动力不足'],
    },
    health: {
      bodyParts: ['肾脏', '膀胱', '泌尿系统', '耳朵'],
      risks: ['肾虚', '腰膝酸软', '听力下降', '水肿'],
      advice: '注意保暖，避免过度劳累，适当补肾养精',
    },
    lifePath: {
      career: ['休闲产业', '养生保健', '酒店管理', '咨询顾问', '心理辅导', '人力资源'],
      direction: '适合稳定发展型工作，不宜冒险激进',
      advice: '学会主动出击，在休养生息中蓄势待发',
    },
    communication: {
      style: '温和型',
      strengths: ['善于倾听', '不急于表态', '给人安全感', '语气平和'],
      weaknesses: ['表达不够积极', '容易被忽视', '缺乏说服力'],
      advice: '增强表达自信，适时展现观点，不要总是附和他人',
    },
  },
  {
    id: 'sheng',
    name: '生门',
    type: 'gate',
    nature: 'auspicious',
    element: '土',
    direction: '东北',
    personality: {
      traits: ['积极向上', '生机勃勃', '富有创造力', '乐观开朗'],
      strengths: ['善于开创', '充满活力', '能带动他人', '适应力强'],
      weaknesses: ['急于求成', '缺乏耐心', '容易骄傲', '目标过多'],
    },
    health: {
      bodyParts: ['脾胃', '肌肉', '消化系统'],
      risks: ['脾胃不和', '消化不良', '肌肉劳损'],
      advice: '饮食规律，避免暴饮暴食，保持运动习惯',
    },
    lifePath: {
      career: ['创业者', '投资理财', '房地产', '农业', '教育培训', '项目开发'],
      direction: '适合开拓新领域，创造财富与价值',
      advice: '把握机遇，但要脚踏实地，避免过度扩张',
    },
    communication: {
      style: '激励型',
      strengths: ['富有感染力', '善于鼓励他人', '积极正面', '能带动氛围'],
      weaknesses: ['过于乐观', '忽视细节', '承诺过多'],
      advice: '在激励他人的同时，注意承诺的可行性',
    },
  },
  {
    id: 'shang',
    name: '伤门',
    type: 'gate',
    nature: 'inauspicious',
    element: '木',
    direction: '正东',
    personality: {
      traits: ['刚烈果断', '敢于竞争', '直言不讳', '行动迅速'],
      strengths: ['执行力强', '不畏困难', '敢于挑战', '效率高'],
      weaknesses: ['容易伤人', '冲动鲁莽', '不顾后果', '得罪人'],
    },
    health: {
      bodyParts: ['肝胆', '筋骨', '四肢', '眼睛'],
      risks: ['肝火旺盛', '筋骨损伤', '意外伤害', '视力问题'],
      advice: '控制情绪，避免激烈运动导致受伤，护肝养目',
    },
    lifePath: {
      career: ['运动员', '军警', '外科医生', '律师', '竞技行业', '销售精英'],
      direction: '适合需要竞争和突破的领域',
      advice: '学会圆融处事，竞争中不要伤害他人',
    },
    communication: {
      style: '直接型',
      strengths: ['直言快语', '不拐弯抹角', '效率高', '有魄力'],
      weaknesses: ['言语伤人', '不顾他人感受', '容易起冲突'],
      advice: '说话前三思，批评时注意方式，多用建议代替指责',
    },
  },
  {
    id: 'du',
    name: '杜门',
    type: 'gate',
    nature: 'neutral',
    element: '木',
    direction: '东南',
    personality: {
      traits: ['谨慎保守', '善于隐藏', '深思熟虑', '防守型'],
      strengths: ['保密性强', '不轻易暴露', '善于保护', '稳重'],
      weaknesses: ['过于封闭', '不善表达', '错失机会', '缺乏主动'],
    },
    health: {
      bodyParts: ['胆经', '神经系统', '呼吸道'],
      risks: ['抑郁倾向', '呼吸系统问题', '神经衰弱'],
      advice: '多与人交流，避免自我封闭，保持心情舒畅',
    },
    lifePath: {
      career: ['保密工作', '档案管理', '安保行业', '研究开发', '隐私保护', '情报分析'],
      direction: '适合需要保密和深度思考的工作',
      advice: '在守护秘密的同时，不要错过展示自我的机会',
    },
    communication: {
      style: '含蓄型',
      strengths: ['守口如瓶', '言简意赅', '不说废话', '可信赖'],
      weaknesses: ['表达不清', '让人猜测', '不善于推销自己'],
      advice: '该说的要说清楚，不要让沉默造成误解',
    },
  },
  {
    id: 'jing',
    name: '景门',
    type: 'gate',
    nature: 'neutral',
    element: '火',
    direction: '正南',
    personality: {
      traits: ['光明磊落', '热情外向', '善于表达', '追求荣誉'],
      strengths: ['表现力强', '有魅力', '善于展示', '热情洋溢'],
      weaknesses: ['过于张扬', '好大喜功', '虚荣心重', '不够务实'],
    },
    health: {
      bodyParts: ['心脏', '血液循环', '眼睛', '小肠'],
      risks: ['心血管问题', '血压异常', '眼疾', '心火过旺'],
      advice: '避免过度兴奋，注意心脏保养，控制情绪起伏',
    },
    lifePath: {
      career: ['演艺娱乐', '广告传媒', '公关形象', '教育演讲', '设计艺术', '网红主播'],
      direction: '适合需要展示和表现的行业',
      advice: '在追求光彩的同时，要注重内在修养',
    },
    communication: {
      style: '表演型',
      strengths: ['口才出众', '善于演讲', '有感染力', '生动形象'],
      weaknesses: ['过于夸张', '不够真诚', '话多'],
      advice: '表达要有度，真诚比华丽更能打动人心',
    },
  },
  {
    id: 'si',
    name: '死门',
    type: 'gate',
    nature: 'inauspicious',
    element: '土',
    direction: '西南',
    personality: {
      traits: ['沉稳冷静', '善于结束', '不畏死亡', '执着坚定'],
      strengths: ['不惧困难', '善于了结', '心理强大', '能承受压力'],
      weaknesses: ['过于悲观', '缺乏活力', '固执己见', '不懂变通'],
    },
    health: {
      bodyParts: ['脾胃', '肌肉', '免疫系统'],
      risks: ['慢性疾病', '免疫力下降', '抑郁症'],
      advice: '保持积极心态，多接触阳光和正能量的人',
    },
    lifePath: {
      career: ['殡葬行业', '医疗急救', '心理危机干预', '资产清算', '遗产处理', '保险理赔'],
      direction: '适合处理结束性、终结性事务的工作',
      advice: '学会在结束中看到新生，保持希望',
    },
    communication: {
      style: '严肃型',
      strengths: ['言语有分量', '不说废话', '能说服人', '庄重'],
      weaknesses: ['过于沉重', '缺乏幽默', '让人压抑'],
      advice: '适当加入轻松元素，不要总是严肃沉重',
    },
  },
  {
    id: 'jing2',
    name: '惊门',
    type: 'gate',
    nature: 'inauspicious',
    element: '金',
    direction: '正西',
    personality: {
      traits: ['敏感多疑', '反应迅速', '善于察觉', '警觉性高'],
      strengths: ['直觉敏锐', '反应快', '善于发现问题', '危机意识强'],
      weaknesses: ['神经紧张', '多疑多虑', '容易恐慌', '疑心重'],
    },
    health: {
      bodyParts: ['肺部', '呼吸系统', '皮肤', '大肠'],
      risks: ['焦虑症', '失眠', '皮肤敏感', '呼吸问题'],
      advice: '学会放松，不要过度紧张，培养安全感',
    },
    lifePath: {
      career: ['安全检查', '风险评估', '审计监察', '法律诉讼', '危机公关', '侦探调查'],
      direction: '适合需要警觉和发现问题的工作',
      advice: '在保持警觉的同时，不要草木皆兵',
    },
    communication: {
      style: '警觉型',
      strengths: ['观察敏锐', '能发现破绽', '提问犀利', '不易被骗'],
      weaknesses: ['过于挑剔', '让人紧张', '缺乏信任感'],
      advice: '给他人信任和安全感，不要总是质疑',
    },
  },
  {
    id: 'kai',
    name: '开门',
    type: 'gate',
    nature: 'auspicious',
    element: '金',
    direction: '西北',
    personality: {
      traits: ['大气磊落', '领导风范', '善于开拓', '正直公正'],
      strengths: ['有领导力', '善于决策', '公正无私', '格局大'],
      weaknesses: ['过于强势', '不够细腻', '独断专行'],
    },
    health: {
      bodyParts: ['肺部', '头部', '骨骼', '大肠'],
      risks: ['呼吸系统问题', '头痛', '骨质问题'],
      advice: '注意劳逸结合，不要过度操劳，保护呼吸系统',
    },
    lifePath: {
      career: ['企业高管', '政府官员', '创业家', '项目负责人', '开拓先锋', '外交官'],
      direction: '适合领导和开拓性工作',
      advice: '在开拓进取的同时，注意团队协作',
    },
    communication: {
      style: '领导型',
      strengths: ['言语有权威', '善于决策表态', '振奋人心', '有号召力'],
      weaknesses: ['过于强势', '不听他人意见', '独断'],
      advice: '多倾听下属意见，不要总是一言堂',
    },
  },
];

// ===== 九星 =====
export const NINE_STARS: QimenSymbolInfo[] = [
  {
    id: 'tianpeng',
    name: '天蓬',
    alias: '贪狼星',
    type: 'star',
    nature: 'inauspicious',
    element: '水',
    personality: {
      traits: ['足智多谋', '善于策划', '野心勃勃', '不拘小节'],
      strengths: ['智慧过人', '善于谋略', '胆大心细', '适应力强'],
      weaknesses: ['贪心不足', '不择手段', '阴险狡诈', '欲望强烈'],
    },
    health: {
      bodyParts: ['肾脏', '生殖系统', '膀胱', '血液'],
      risks: ['肾脏疾病', '泌尿问题', '血液疾病'],
      advice: '节制欲望，保护肾脏，避免过度劳累',
    },
    lifePath: {
      career: ['军事战略', '商业谋划', '投资策划', '情报工作', '游戏设计', '编剧导演'],
      direction: '适合需要谋略和策划的领域',
      advice: '智谋要用在正道，不可贪得无厌',
    },
    communication: {
      style: '策略型',
      strengths: ['善于布局', '说话有深意', '能操控话题', '洞察人心'],
      weaknesses: ['不够真诚', '让人难以信任', '话中有话'],
      advice: '真诚待人，不要总是算计，信任是基础',
    },
  },
  {
    id: 'tianrui',
    name: '天芮',
    alias: '巨门星',
    type: 'star',
    nature: 'inauspicious',
    element: '土',
    personality: {
      traits: ['谨慎多虑', '善于分析', '追求完美', '批判性强'],
      strengths: ['分析能力强', '注重细节', '善于发现问题', '严谨'],
      weaknesses: ['多疑多虑', '吹毛求疵', '负能量重', '容易生病'],
    },
    health: {
      bodyParts: ['脾胃', '消化系统', '皮肤', '肌肉'],
      risks: ['脾胃病', '皮肤病', '慢性疾病', '心理疾病'],
      advice: '保持积极心态，注意饮食卫生，不要过度担忧',
    },
    lifePath: {
      career: ['医疗诊断', '质量检测', '审计会计', '编辑校对', '实验研究', '法医鉴定'],
      direction: '适合需要分析和检验的工作',
      advice: '发挥分析优势，但不要过于挑剔',
    },
    communication: {
      style: '分析型',
      strengths: ['逻辑清晰', '善于提问', '能发现漏洞', '思维严密'],
      weaknesses: ['过于挑剔', '负面思维', '让人不舒服'],
      advice: '批评要有建设性，多看积极面',
    },
  },
  {
    id: 'tianchong',
    name: '天冲',
    alias: '禄存星',
    type: 'star',
    nature: 'auspicious',
    element: '木',
    personality: {
      traits: ['果敢勇猛', '行动迅速', '敢于冲锋', '不畏艰险'],
      strengths: ['执行力强', '勇往直前', '敢于突破', '效率高'],
      weaknesses: ['冲动鲁莽', '有勇无谋', '不顾后果', '容易受伤'],
    },
    health: {
      bodyParts: ['肝胆', '筋骨', '头部', '四肢'],
      risks: ['肝胆问题', '外伤', '头痛', '筋骨损伤'],
      advice: '行动前多思考，避免冲动受伤，护肝养胆',
    },
    lifePath: {
      career: ['军人武警', '消防救援', '运动竞技', '急救医疗', '探险家', '赛车手'],
      direction: '适合需要勇气和行动力的工作',
      advice: '勇敢的同时要有智慧，不可匹夫之勇',
    },
    communication: {
      style: '直冲型',
      strengths: ['简洁有力', '不拖泥带水', '有冲击力', '振奋人心'],
      weaknesses: ['过于直接', '不够委婉', '容易冒犯人'],
      advice: '说话可以直接，但要注意场合和对象',
    },
  },
  {
    id: 'tianfu',
    name: '天辅',
    alias: '文曲星',
    type: 'star',
    nature: 'auspicious',
    element: '木',
    personality: {
      traits: ['温文尔雅', '博学多才', '善于辅助', '谦逊有礼'],
      strengths: ['学识渊博', '善于教导', '有涵养', '能辅佐他人'],
      weaknesses: ['过于依附', '缺乏主见', '不善争斗', '优柔寡断'],
    },
    health: {
      bodyParts: ['肝脏', '眼睛', '神经系统', '筋络'],
      risks: ['肝气不舒', '视力问题', '神经衰弱'],
      advice: '培养独立性，保护眼睛，舒缓肝气',
    },
    lifePath: {
      career: ['教育培训', '学术研究', '秘书助理', '翻译编辑', '文化传播', '图书管理'],
      direction: '适合文化教育和辅助性工作',
      advice: '在辅助他人的同时，也要建立自己的核心能力',
    },
    communication: {
      style: '辅助型',
      strengths: ['善于解释', '耐心教导', '条理清晰', '知识丰富'],
      weaknesses: ['不够果断', '缺乏主导', '过于谦逊'],
      advice: '适时展现专业权威，不要总是配角心态',
    },
  },
  {
    id: 'tianqin',
    name: '天禽',
    alias: '廉贞星',
    type: 'star',
    nature: 'neutral',
    element: '土',
    personality: {
      traits: ['居中调和', '稳定可靠', '善于平衡', '核心地位'],
      strengths: ['能调和矛盾', '稳定大局', '核心人物', '有凝聚力'],
      weaknesses: ['过于中庸', '缺乏特色', '不够突出', '容易被忽视'],
    },
    health: {
      bodyParts: ['脾胃', '腹部', '消化系统'],
      risks: ['脾胃不和', '腹部疾病', '代谢问题'],
      advice: '饮食规律，保持稳定的生活节奏',
    },
    lifePath: {
      career: ['协调管理', '中介服务', '平台运营', '调解仲裁', '物流中心', '枢纽管理'],
      direction: '适合居中协调和平台型工作',
      advice: '发挥核心优势，成为团队的定海神针',
    },
    communication: {
      style: '协调型',
      strengths: ['善于调和', '不偏不倚', '能平衡各方', '有亲和力'],
      weaknesses: ['立场不明', '过于圆滑', '缺乏主见'],
      advice: '协调的同时要有自己的原则和底线',
    },
  },
  {
    id: 'tianxin',
    name: '天心',
    alias: '武曲星',
    type: 'star',
    nature: 'auspicious',
    element: '金',
    personality: {
      traits: ['正直果断', '公正无私', '善于决断', '有责任心'],
      strengths: ['决策力强', '公正客观', '有原则', '值得信赖'],
      weaknesses: ['过于刚硬', '不够灵活', '不近人情'],
    },
    health: {
      bodyParts: ['肺部', '心脏', '大肠', '皮肤'],
      risks: ['呼吸问题', '心脏问题', '皮肤干燥'],
      advice: '注意情绪调节，不要过于压抑，滋阴润肺',
    },
    lifePath: {
      career: ['法官律师', '纪检监察', '医疗诊断', '财务审计', '品质管理', '决策顾问'],
      direction: '适合需要公正决断的工作',
      advice: '刚正的同时要有温度，法理情并重',
    },
    communication: {
      style: '决断型',
      strengths: ['言出必行', '说话有分量', '公正客观', '令人信服'],
      weaknesses: ['过于严肃', '缺乏温度', '不留余地'],
      advice: '决断后要留有余地，刚中带柔',
    },
  },
  {
    id: 'tianzhu',
    name: '天柱',
    alias: '破军星',
    type: 'star',
    nature: 'inauspicious',
    element: '金',
    personality: {
      traits: ['特立独行', '不畏权威', '敢于破旧', '有个性'],
      strengths: ['敢于创新', '不随大流', '有突破力', '独立'],
      weaknesses: ['过于叛逆', '不合群', '破坏性强', '不服管教'],
    },
    health: {
      bodyParts: ['肺部', '骨骼', '牙齿', '脊椎'],
      risks: ['骨骼问题', '牙齿问题', '脊椎病'],
      advice: '注意骨骼保护，不要过度劳累脊椎',
    },
    lifePath: {
      career: ['改革创新', '破旧立新', '拆迁重建', '革命者', '批评家', '独立艺术家'],
      direction: '适合需要打破常规的工作',
      advice: '破旧是为了立新，不要为破而破',
    },
    communication: {
      style: '颠覆型',
      strengths: ['敢于质疑', '有批判性', '不人云亦云', '有见地'],
      weaknesses: ['过于尖锐', '容易得罪人', '不尊重他人'],
      advice: '批评要有建设性，破中有立',
    },
  },
  {
    id: 'tianren',
    name: '天任',
    alias: '左辅星',
    type: 'star',
    nature: 'auspicious',
    element: '土',
    personality: {
      traits: ['厚德载物', '任劳任怨', '稳重可靠', '有担当'],
      strengths: ['能承担责任', '踏实肯干', '有耐心', '值得依靠'],
      weaknesses: ['过于老实', '不善表现', '容易吃亏', '被人利用'],
    },
    health: {
      bodyParts: ['脾胃', '肌肉', '消化系统', '腰部'],
      risks: ['脾胃虚弱', '肌肉劳损', '腰部问题'],
      advice: '不要过度劳累，注意腰部保护，健脾养胃',
    },
    lifePath: {
      career: ['基层管理', '后勤保障', '项目执行', '农业畜牧', '建筑施工', '慈善公益'],
      direction: '适合需要踏实执行的工作',
      advice: '在默默付出的同时，也要懂得展示成果',
    },
    communication: {
      style: '务实型',
      strengths: ['言行一致', '踏实可靠', '不说空话', '有执行力'],
      weaknesses: ['表达不够', '不善推销自己', '过于低调'],
      advice: '适当表现自己的贡献，不要总是默默无闻',
    },
  },
  {
    id: 'tianying',
    name: '天英',
    alias: '右弼星',
    type: 'star',
    nature: 'neutral',
    element: '火',
    personality: {
      traits: ['聪明伶俐', '多才多艺', '热情活泼', '善于应变'],
      strengths: ['反应快', '创意多', '有魅力', '善于表现'],
      weaknesses: ['不够专注', '浮躁', '虎头蛇尾', '容易骄傲'],
    },
    health: {
      bodyParts: ['心脏', '血液', '眼睛', '小肠'],
      risks: ['心火旺盛', '眼疾', '血压问题'],
      advice: '避免过度兴奋，保护眼睛和心脏',
    },
    lifePath: {
      career: ['演艺娱乐', '广告创意', '设计艺术', '公关活动', '品牌策划', '网络红人'],
      direction: '适合需要创意和表现力的工作',
      advice: '在展现才华的同时，要有定力和专注',
    },
    communication: {
      style: '魅力型',
      strengths: ['口才好', '有感染力', '善于表演', '吸引人'],
      weaknesses: ['华而不实', '不够深刻', '缺乏持久'],
      advice: '魅力要配合内涵，不能只有表面功夫',
    },
  },
];

// ===== 八神 =====
export const EIGHT_GODS: QimenSymbolInfo[] = [
  {
    id: 'zhifu',
    name: '值符',
    type: 'god',
    nature: 'auspicious',
    element: '土',
    personality: {
      traits: ['尊贵权威', '统领全局', '贵人相助', '有领导力'],
      strengths: ['地位尊崇', '能得贵人', '有权威', '能服众'],
      weaknesses: ['高高在上', '不够亲民', '容易孤立'],
    },
    health: {
      bodyParts: ['脾胃', '免疫系统', '头部'],
      risks: ['脾胃问题', '头部疾病', '免疫力问题'],
      advice: '保持谦逊，不要过于劳心，注意休息',
    },
    lifePath: {
      career: ['高层管理', '政府要职', '企业董事', '核心决策层', '贵人引荐型职业'],
      direction: '适合领导和核心位置',
      advice: '用好贵人运，但不要过度依赖',
    },
    communication: {
      style: '权威型',
      strengths: ['一言九鼎', '有号召力', '令人敬重', '能定调'],
      weaknesses: ['不够平易', '缺乏互动', '让人有距离感'],
      advice: '权威中带有亲和，不要总是高高在上',
    },
  },
  {
    id: 'tengshe',
    name: '螣蛇',
    alias: '腾蛇',
    type: 'god',
    nature: 'inauspicious',
    personality: {
      traits: ['善于变化', '虚虚实实', '多疑多变', '不安定'],
      strengths: ['灵活多变', '善于伪装', '反应迅速', '不拘一格'],
      weaknesses: ['反复无常', '不够真实', '让人难以信任', '焦虑不安'],
    },
    health: {
      bodyParts: ['神经系统', '心理', '皮肤'],
      risks: ['焦虑症', '失眠多梦', '皮肤病', '神经衰弱'],
      advice: '培养安全感，避免过度焦虑，保持稳定',
    },
    lifePath: {
      career: ['变化型工作', '演员编剧', '魔术表演', '谈判斡旋', '应变处理', '危机公关'],
      direction: '适合需要灵活变通的工作',
      advice: '变化是优势，但要有底线和真诚',
    },
    communication: {
      style: '变化型',
      strengths: ['能随机应变', '话术高明', '善于周旋', '能化解尴尬'],
      weaknesses: ['不够真诚', '让人难以捉摸', '缺乏信任'],
      advice: '灵活的同时要有诚信底线',
    },
  },
  {
    id: 'taiyin',
    name: '太阴',
    type: 'god',
    nature: 'auspicious',
    personality: {
      traits: ['阴柔内敛', '善于隐藏', '暗中帮助', '温和细腻'],
      strengths: ['善于幕后工作', '能暗中帮人', '细腻周到', '不张扬'],
      weaknesses: ['过于隐晦', '不够阳光', '让人难以了解'],
    },
    health: {
      bodyParts: ['眼睛', '内分泌', '女性生殖系统'],
      risks: ['视力问题', '内分泌失调', '妇科问题'],
      advice: '多晒太阳，保持心情开朗，注意内分泌调节',
    },
    lifePath: {
      career: ['幕后工作', '秘密任务', '私人助理', '暗访调查', '夜间工作', '月子中心'],
      direction: '适合幕后和隐蔽性工作',
      advice: '暗中帮人是美德，但也要适当展现自己',
    },
    communication: {
      style: '暗示型',
      strengths: ['善于暗示', '委婉表达', '不伤和气', '善于保密'],
      weaknesses: ['不够直接', '容易被误解', '过于隐晦'],
      advice: '该直接时要直接，不要总是绕弯子',
    },
  },
  {
    id: 'liuhe',
    name: '六合',
    type: 'god',
    nature: 'auspicious',
    personality: {
      traits: ['善于合作', '和谐圆融', '人缘极佳', '善于沟通'],
      strengths: ['能促成合作', '善于调和', '人脉广', '受欢迎'],
      weaknesses: ['过于迁就', '缺乏原则', '容易当老好人'],
    },
    health: {
      bodyParts: ['肝胆', '筋络', '关节'],
      risks: ['肝气郁结', '关节问题', '筋络不通'],
      advice: '保持情绪舒畅，适当运动疏通筋络',
    },
    lifePath: {
      career: ['商务合作', '婚介红娘', '外交联络', '公关协调', '中介服务', '合伙经营'],
      direction: '适合需要合作和联络的工作',
      advice: '合作共赢是好事，但要有自己的底线',
    },
    communication: {
      style: '合作型',
      strengths: ['善于拉近距离', '能找到共同点', '促成合作', '圆融'],
      weaknesses: ['过于讨好', '缺乏立场', '容易妥协'],
      advice: '合作要双赢，不能总是牺牲自己',
    },
  },
  {
    id: 'baihu',
    name: '白虎',
    type: 'god',
    nature: 'inauspicious',
    personality: {
      traits: ['威猛刚烈', '杀伐果断', '不畏强权', '有魄力'],
      strengths: ['有威慑力', '敢于行动', '执行力强', '不拖泥带水'],
      weaknesses: ['过于暴戾', '容易伤人', '不够温和', '有血光之忧'],
    },
    health: {
      bodyParts: ['肺部', '大肠', '骨骼', '皮肤'],
      risks: ['外伤', '手术', '骨折', '肺部问题'],
      advice: '注意安全，避免激烈冲突，小心意外',
    },
    lifePath: {
      career: ['军警武职', '外科医生', '屠宰业', '殡葬业', '竞技格斗', '刑侦司法'],
      direction: '适合需要威慑力和执行力的工作',
      advice: '威严要有度，不可滥用武力',
    },
    communication: {
      style: '威慑型',
      strengths: ['有震慑力', '说话有分量', '能镇住场面', '不怒自威'],
      weaknesses: ['过于强硬', '让人害怕', '缺乏亲和力'],
      advice: '威严中带有温度，不要总是咄咄逼人',
    },
  },
  {
    id: 'xuanwu',
    name: '玄武',
    type: 'god',
    nature: 'inauspicious',
    personality: {
      traits: ['神秘莫测', '善于隐藏', '心思深沉', '不可捉摸'],
      strengths: ['深谋远虑', '善于保密', '洞察力强', '能识破他人'],
      weaknesses: ['过于阴暗', '不够光明', '容易被骗或骗人', '有盗窃之忧'],
    },
    health: {
      bodyParts: ['肾脏', '生殖系统', '膀胱', '耳朵'],
      risks: ['肾脏问题', '泌尿问题', '听力问题'],
      advice: '保持正直，不要走旁门左道，护肾养精',
    },
    lifePath: {
      career: ['情报工作', '侦探调查', '保密工作', '玄学研究', '心理分析', '暗访记者'],
      direction: '适合需要洞察和保密的工作',
      advice: '智慧要用在正途，不可走歪门邪道',
    },
    communication: {
      style: '深沉型',
      strengths: ['善于倾听', '能识破谎言', '洞察人心', '不轻易表态'],
      weaknesses: ['让人难以信任', '过于神秘', '不够坦诚'],
      advice: '适当敞开心扉，不要总是让人猜测',
    },
  },
  {
    id: 'jiudi',
    name: '九地',
    type: 'god',
    nature: 'auspicious',
    personality: {
      traits: ['厚德载物', '包容万物', '稳重踏实', '有承载力'],
      strengths: ['能承受压力', '包容心强', '稳定可靠', '有耐心'],
      weaknesses: ['过于保守', '缺乏变化', '不够灵活', '容易固执'],
    },
    health: {
      bodyParts: ['脾胃', '腹部', '肌肉', '皮肤'],
      risks: ['脾胃虚弱', '腹部问题', '体重问题'],
      advice: '保持运动，不要久坐，注意饮食健康',
    },
    lifePath: {
      career: ['房地产', '农业种植', '基础建设', '仓储物流', '殡葬行业', '地质勘探'],
      direction: '适合与土地和基础相关的工作',
      advice: '稳扎稳打是优势，但也要适时变通',
    },
    communication: {
      style: '稳重型',
      strengths: ['言语稳重', '给人安全感', '不急不躁', '有耐心'],
      weaknesses: ['反应慢', '不够灵活', '过于保守'],
      advice: '稳重的同时要有应变能力',
    },
  },
  {
    id: 'jiutian',
    name: '九天',
    type: 'god',
    nature: 'auspicious',
    personality: {
      traits: ['志向高远', '积极向上', '勇于攀登', '胸怀大志'],
      strengths: ['志向远大', '能往高处走', '积极进取', '有上进心'],
      weaknesses: ['好高骛远', '不够务实', '眼高手低'],
    },
    health: {
      bodyParts: ['头部', '肺部', '呼吸系统'],
      risks: ['头痛', '呼吸问题', '高血压'],
      advice: '脚踏实地，不要过度劳心，保护头部',
    },
    lifePath: {
      career: ['航空航天', '高层管理', '科技创新', '登山探险', '飞行员', '高端服务'],
      direction: '适合往高处发展的工作',
      advice: '志向高远的同时要脚踏实地',
    },
    communication: {
      style: '激励型',
      strengths: ['能激励人心', '有远见', '善于描绘愿景', '鼓舞士气'],
      weaknesses: ['过于理想化', '不够务实', '承诺过高'],
      advice: '愿景要配合行动，不能只画大饼',
    },
  },
];

// ===== 三奇六仪 =====
export const STEMS: QimenSymbolInfo[] = [
  {
    id: 'yi',
    name: '乙奇',
    alias: '日奇',
    type: 'stem',
    nature: 'auspicious',
    element: '木',
    personality: {
      traits: ['柔韧灵活', '善于变通', '阴柔内敛', '适应力强'],
      strengths: ['能屈能伸', '善于周旋', '不与人争', '有韧性'],
      weaknesses: ['过于柔弱', '缺乏主见', '容易依附他人'],
    },
    health: {
      bodyParts: ['肝脏', '筋络', '颈椎', '手指'],
      risks: ['肝气郁结', '颈椎问题', '筋络不通'],
      advice: '保持情绪舒畅，适当运动拉伸筋络',
    },
    lifePath: {
      career: ['文秘助理', '艺术创作', '花卉园艺', '中医养生', '瑜伽教练', '心理咨询'],
      direction: '适合需要柔韧和变通的工作',
      advice: '柔中有刚，不要过于依附他人',
    },
    communication: {
      style: '柔和型',
      strengths: ['温和委婉', '善于迂回', '不伤和气', '有亲和力'],
      weaknesses: ['不够直接', '过于迂回', '缺乏力度'],
      advice: '委婉中要有明确表达，不要让人误解',
    },
  },
  {
    id: 'bing',
    name: '丙奇',
    alias: '月奇',
    type: 'stem',
    nature: 'auspicious',
    element: '火',
    personality: {
      traits: ['光明磊落', '热情奔放', '积极向上', '有领导力'],
      strengths: ['能照亮他人', '热情感染人', '正能量强', '有魄力'],
      weaknesses: ['过于强势', '容易急躁', '不够细腻'],
    },
    health: {
      bodyParts: ['心脏', '小肠', '眼睛', '血液循环'],
      risks: ['心火旺盛', '血压问题', '眼疾'],
      advice: '控制情绪，避免过度兴奋，保护心脏和眼睛',
    },
    lifePath: {
      career: ['领导管理', '演艺娱乐', '能源行业', '热能工程', '消防救援', '品牌推广'],
      direction: '适合需要热情和光芒的工作',
      advice: '光芒要温暖他人，不要灼伤自己和别人',
    },
    communication: {
      style: '热情型',
      strengths: ['充满激情', '感染力强', '能鼓舞人心', '阳光正面'],
      weaknesses: ['过于强势', '不留余地', '容易急躁'],
      advice: '热情中带有倾听，不要总是一个人唱独角戏',
    },
  },
  {
    id: 'ding',
    name: '丁奇',
    alias: '星奇',
    type: 'stem',
    nature: 'auspicious',
    element: '火',
    personality: {
      traits: ['文雅细腻', '智慧灵动', '善于思考', '有洞察力'],
      strengths: ['思维敏捷', '善于发现', '有创意', '文采好'],
      weaknesses: ['过于敏感', '想太多', '缺乏行动力'],
    },
    health: {
      bodyParts: ['心脏', '眼睛', '神经系统'],
      risks: ['心火不足', '视力问题', '神经敏感'],
      advice: '保持心态平和，不要过度用脑，保护眼睛',
    },
    lifePath: {
      career: ['文化创作', '策划设计', '情报分析', '学术研究', '占卜预测', '灯光设计'],
      direction: '适合需要智慧和创意的工作',
      advice: '智慧要配合行动，不能只停留在想法',
    },
    communication: {
      style: '智慧型',
      strengths: ['言辞精妙', '善于点拨', '有深度', '能启发人'],
      weaknesses: ['过于含蓄', '不够直白', '让人难懂'],
      advice: '智慧的表达要让人能理解，不要过于高深',
    },
  },
  {
    id: 'wu',
    name: '戊仪',
    type: 'stem',
    nature: 'neutral',
    element: '土',
    personality: {
      traits: ['厚重稳健', '诚实可靠', '有担当', '踏实肯干'],
      strengths: ['稳定可靠', '有责任心', '能承担', '值得信赖'],
      weaknesses: ['过于固执', '不够灵活', '反应慢'],
    },
    health: {
      bodyParts: ['脾胃', '肌肉', '消化系统', '皮肤'],
      risks: ['脾胃不和', '肌肉劳损', '消化问题'],
      advice: '饮食规律，适当运动，不要过度劳累',
    },
    lifePath: {
      career: ['房地产', '建筑施工', '农业种植', '财务管理', '仓储物流', '基础设施'],
      direction: '适合稳定和基础性工作',
      advice: '稳健是优势，但也要适时创新',
    },
    communication: {
      style: '务实型',
      strengths: ['言出必行', '诚实可靠', '不说空话', '踏实'],
      weaknesses: ['不够灵活', '表达单调', '缺乏趣味'],
      advice: '务实中加入一些变化和趣味',
    },
  },
  {
    id: 'ji',
    name: '己仪',
    type: 'stem',
    nature: 'neutral',
    element: '土',
    personality: {
      traits: ['谦逊内敛', '善于包容', '细腻周到', '有涵养'],
      strengths: ['包容心强', '善于服务', '细致入微', '有耐心'],
      weaknesses: ['过于低调', '缺乏自信', '容易委曲求全'],
    },
    health: {
      bodyParts: ['脾胃', '肌肉', '腹部'],
      risks: ['脾胃虚弱', '腹部问题', '营养不良'],
      advice: '增强自信，注意营养均衡，保护脾胃',
    },
    lifePath: {
      career: ['服务行业', '行政后勤', '人事管理', '护理照料', '幼教保育', '农业生产'],
      direction: '适合服务和支持性工作',
      advice: '服务他人的同时也要有自己的价值主张',
    },
    communication: {
      style: '谦逊型',
      strengths: ['善于倾听', '不争不抢', '让人舒服', '有涵养'],
      weaknesses: ['过于低调', '容易被忽视', '缺乏表现'],
      advice: '谦逊中要有自信，适当展现自己',
    },
  },
  {
    id: 'geng',
    name: '庚仪',
    type: 'stem',
    nature: 'inauspicious',
    element: '金',
    personality: {
      traits: ['刚硬果断', '勇于竞争', '有魄力', '不服输'],
      strengths: ['执行力强', '敢于挑战', '有突破力', '能开拓'],
      weaknesses: ['过于刚硬', '容易伤人', '不够圆融', '树敌多'],
    },
    health: {
      bodyParts: ['肺部', '大肠', '骨骼', '皮肤'],
      risks: ['呼吸问题', '骨骼问题', '外伤', '手术'],
      advice: '避免冲突，注意安全，保护肺部和骨骼',
    },
    lifePath: {
      career: ['军警武职', '竞技体育', '外科手术', '金属加工', '机械制造', '司法执法'],
      direction: '适合需要突破和竞争的工作',
      advice: '刚强中要有柔和，不要四处树敌',
    },
    communication: {
      style: '强硬型',
      strengths: ['言辞锐利', '有冲击力', '能震慑人', '不含糊'],
      weaknesses: ['过于尖锐', '容易伤人', '缺乏温度'],
      advice: '刚中带柔，不要总是咄咄逼人',
    },
  },
  {
    id: 'xin',
    name: '辛仪',
    type: 'stem',
    nature: 'neutral',
    element: '金',
    personality: {
      traits: ['细腻敏感', '追求完美', '有品味', '注重细节'],
      strengths: ['审美力强', '精益求精', '有鉴赏力', '品质高'],
      weaknesses: ['过于挑剔', '完美主义', '容易焦虑', '不够大气'],
    },
    health: {
      bodyParts: ['肺部', '皮肤', '牙齿', '呼吸系统'],
      risks: ['皮肤敏感', '呼吸问题', '牙齿问题'],
      advice: '保持心态平和，不要过度追求完美，保护皮肤',
    },
    lifePath: {
      career: ['珠宝设计', '美容美妆', '品质检验', '艺术鉴赏', '精密工艺', '奢侈品行业'],
      direction: '适合需要精细和品味的工作',
      advice: '追求完美的同时要能接受不完美',
    },
    communication: {
      style: '精细型',
      strengths: ['表达精准', '用词考究', '有品味', '注重细节'],
      weaknesses: ['过于挑剔', '让人紧张', '不够随和'],
      advice: '精细中带有宽容，不要让人感到压力',
    },
  },
  {
    id: 'ren',
    name: '壬仪',
    type: 'stem',
    nature: 'neutral',
    element: '水',
    personality: {
      traits: ['智慧深沉', '善于变通', '适应力强', '有谋略'],
      strengths: ['善于流动', '能审时度势', '智慧过人', '应变力强'],
      weaknesses: ['过于圆滑', '缺乏原则', '不够坚定', '让人难以捉摸'],
    },
    health: {
      bodyParts: ['肾脏', '膀胱', '泌尿系统', '耳朵'],
      risks: ['肾脏问题', '泌尿问题', '水肿'],
      advice: '保持原则，不要过度变通，护肾养精',
    },
    lifePath: {
      career: ['航海运输', '水利工程', '物流运输', '金融流通', '咨询顾问', '旅游服务'],
      direction: '适合需要流动和变通的工作',
      advice: '流动中要有方向，不能随波逐流',
    },
    communication: {
      style: '流动型',
      strengths: ['善于变通', '能随机应变', '灵活多变', '不死板'],
      weaknesses: ['过于圆滑', '让人难以信任', '缺乏立场'],
      advice: '灵活的同时要有原则底线',
    },
  },
  {
    id: 'gui',
    name: '癸仪',
    type: 'stem',
    nature: 'neutral',
    element: '水',
    personality: {
      traits: ['阴柔细腻', '善于渗透', '深藏不露', '有耐心'],
      strengths: ['善于暗中努力', '能滴水穿石', '有耐心', '能感化人'],
      weaknesses: ['过于隐晦', '缺乏阳光', '容易阴郁', '不够坦荡'],
    },
    health: {
      bodyParts: ['肾脏', '生殖系统', '血液', '眼泪'],
      risks: ['肾虚', '妇科问题', '情绪抑郁'],
      advice: '多晒太阳，保持心情开朗，避免阴郁',
    },
    lifePath: {
      career: ['心理咨询', '玄学研究', '幕后工作', '护理照料', '清洁环保', '污水处理'],
      direction: '适合幕后和滋养型工作',
      advice: '暗中努力的同时也要让成果被看见',
    },
    communication: {
      style: '渗透型',
      strengths: ['润物细无声', '能感化人', '不激进', '有耐心'],
      weaknesses: ['过于隐晦', '效果慢', '让人不理解'],
      advice: '渗透的同时也要有明确的表达',
    },
  },
];

export const ALL_QIMEN_SYMBOLS = {
  gates: EIGHT_GATES,
  stars: NINE_STARS,
  gods: EIGHT_GODS,
  stems: STEMS,
};
