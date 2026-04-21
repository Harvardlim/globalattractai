/**
 * 十神性格分析数据
 * 依据《八字奇书》、《渊海子平》、《滴天髓》等传统命理学资料整理
 */

export interface TenGodCharacteristics {
  name: string;           // 十神名称
  shortName: string;      // 简称
  strengths: string[];    // 性格优点
  weaknesses: string[];   // 性格缺点
  relationships: string;  // 人际关系特质
  emotionalStyle: string; // 情感模式
  conflictTriggers: string[]; // 冲突触发点
  health: string[];       // 健康倾向
  handlingStyle: string;  // 处事方式
  advice: string[];       // 命理建议
}

export interface TenGodCareer {
  name: string;           // 十神名称
  coreAbilities: string[]; // 核心能力
  traditionalCareers: string[]; // 传统职业参考
  modernCareers: string[]; // 数字经济新职业参考
  suitableRoles: string[]; // 适合岗位
  unsuitableRoles: string[]; // 不适合岗位
}

// 十神性格特征数据（依据八字奇书整理）
export const TEN_GOD_CHARACTERISTICS: Record<string, TenGodCharacteristics> = {
  正官: {
    name: '正官',
    shortName: '官',
    strengths: ['责任感强', '原则性高', '品行端正', '守信守诺', '社会形象佳', '尊重规矩'],
    weaknesses: ['刻板教条', '畏惧变革', '压抑自我', '过于保守', '缺乏变通', '胆小怕事'],
    relationships: '权威依赖型，尊卑秩序分明，对长辈恭敬，对下属宽厚。与领导关系融洽，适合在组织体系中发展。',
    emotionalStyle: '传统保守，婚姻稳定但浪漫匮乏，重视家庭责任，忠诚度高。男命得贤妻，女命得良夫。',
    conflictTriggers: ['遭遇规则破坏者', '被要求变通时', '权威被挑战时'],
    health: ['注意肝胆系统', '易有神经衰弱', '压力过大时易失眠', '需防心血管问题'],
    handlingStyle: '循规蹈矩，按部就班，不喜冒险，凡事讲究程序正义，做事稳重但效率偏低。',
    advice: ['学会灵活变通', '适当释放压力', '不必过于拘泥规则', '培养创新意识'],
  },
  七杀: {
    name: '七杀',
    shortName: '杀',
    strengths: ['果断魄力', '抗压卓越', '危机处理强', '霸气侧漏', '意志坚强', '敢作敢当'],
    weaknesses: ['暴躁易怒', '多疑好斗', '不计后果', '独断专行', '心狠手辣', '缺乏耐心','不听讲', '有自己的想法'],
    relationships: '征服控制型，敬畏多于亲近，树敌明显。对手下要求严格，不容置疑。朋友少但忠诚。',
    emotionalStyle: '强烈占有欲，虐恋倾向，激情易冷。爱恨分明，控制欲强，感情中不甘示弱。',
    conflictTriggers: ['被挑战权威', '遭遇拖延时', '手下不服从时', '被人欺骗时'],
    health: ['注意血光之灾', '易有意外伤害', '肝火旺盛', '需防高血压', '筋骨易受伤'],
    handlingStyle: '绝命相，雷厉风行，杀伐果断，不达目的不罢休。遇事敢于出头，但容易得罪人。',
    advice: ['克制暴躁脾气', '多些耐心和包容', '学会以柔克刚', '注意人际关系'],
  },
  正印: {
    name: '正印',
    shortName: '印',
    strengths: ['慈悲包容', '学识渊博', '精神境界高', '记忆力好', '有涵养', '善于教导','宅心仁厚'],
    weaknesses: ['逃避现实', '缺乏野心', '过度理想化', '依赖心重', '优柔寡断', '不善理财'],
    relationships: '智慧吸引型，天然亲和力，晚辈精神导师。与长辈缘分深，容易得到庇护和提携。',
    emotionalStyle: '无私奉献，情感依赖，母性光环。对伴侣包容度高，但可能过于溺爱。',
    conflictTriggers: ['被索取无度', '遭遇功利者', '信仰被质疑时'],
    health: ['注意呼吸系统', '易有皮肤问题', '肠胃功能弱', '需防甲状腺疾病'],
    handlingStyle: '以德服人，讲究道理，处事温和，善于调解矛盾，不喜正面冲突。',
    advice: ['增强行动力', '不可过于理想化', '学会拒绝无理要求', '培养独立意识'],
  },
  偏印: {
    name: '偏印',
    shortName: '枭',
    strengths: ['深度思考', '创新突破', '玄学悟性', '洞察力强', '独立思考', '不随波逐流', '专研能力强', '逻辑好'],
    weaknesses: ['孤僻乖张', '情感冷漠', '信任障碍', '多疑敏感', '钻牛角尖', '不合群', '老子的能力毋庸置疑', '爱面子'],
    relationships: '要归属感，神秘疏离型，社交极简主义，小众知己。与常人难以沟通，但与同道中人惺惺相惜。',
    emotionalStyle: '精神柏拉图，排斥亲密，需要独立空间。感情中忽冷忽热，难以捉摸。',
    conflictTriggers: ['被侵入私人领域', '要求合群时', '被迫社交时'],
    health: ['注意神经系统', '易有抑郁倾向', '睡眠质量差', '需防精神类疾病', '胃病'],
    handlingStyle: '想法别人跟不上，只关注成果，另辟蹊径，不走寻常路，喜欢独处思考，做事不按常理出牌。',
    advice: ['多与人沟通交流', '不可过于封闭', '培养健康社交', '避免钻牛角尖'],
  },
  正财: {
    name: '正财',
    shortName: '财',
    strengths: ['务实高效', '理财能手', '风险规避', '勤俭持家', '诚实守信', '脚踏实地', '要稳定环境'],
    weaknesses: ['斤斤计较', '物欲束缚', '缺乏格局', '过于保守', '小家子气', '眼光短浅'],
    relationships: '利益纽带型，价值互换原则，可信合作伙伴。交友看重实际利益，但信誉极好。',
    emotionalStyle: '经济共同体，责任大于爱，稳定乏味。婚姻讲究门当户对，感情持久但缺乏浪漫。',
    conflictTriggers: ['遭遇浪费者', '利益受损时', '投资失败时'],
    health: ['注意脾胃系统', '易有消化问题', '因劳累致病', '需防糖尿病'],
    handlingStyle: '精打细算，量入为出，做事讲究投入产出比，不做无把握之事。',
    advice: ['适当放开格局', '不必过于算计', '学会享受生活', '眼光放长远'],
  },
  偏财: {
    name: '偏财',
    shortName: '才',
    strengths: ['资源整合', '慷慨大方', '机遇捕捉', '人脉广阔', '善于交际', '财运亨通'],
    weaknesses: ['投机浮躁', '责任感弱', '情债累累', '好高骛远', '不安分', '花钱无度'],
    relationships: '人脉中心型，饭局灵魂人物，酒肉朋友多。社交能力强，但知心朋友少。',
    emotionalStyle: '多情浪漫，短期关系，物质表达。感情经历丰富，但难以长久。男命易有婚外情。',
    conflictTriggers: ['被索要承诺', '资金链紧张时', '被要求稳定时'],
    health: ['注意肾脏系统', '易因应酬伤身', '酒色过度', '需防泌尿疾病'],
    handlingStyle: '八面玲珑，长袖善舞，喜欢走捷径，比较关注自己，享受赚钱的快感，善于利用资源，但根基不稳。',
    advice: ['培养责任意识', '感情不可滥情', '理财需有规划', '不可投机取巧'],
  },
  食神: {
    name: '食神',
    shortName: '食',
    strengths: ['平和乐天', '创造力强', '生活品味佳', '口才好', '心态好', '福气厚'],
    weaknesses: ['安于现状', '逃避竞争', '过度纵欲', '懒散拖延', '缺乏斗志', '贪图享乐'],
    relationships: '温暖滋养型，群体开心果，矛盾调解者。人缘极好，走到哪里都受欢迎。',
    emotionalStyle: '细水长流，服务型爱人，缺乏激情。对伴侣体贴入微，婚姻幸福和谐。',
    conflictTriggers: ['遭遇高压环境', '被否定生活方式', '被迫竞争时'],
    health: ['注意肠胃系统', '易因饮食伤身', '体重问题', '需防三高'],
    handlingStyle: '辛金相，顺其自然，随遇而安，不喜争斗，以和为贵，处事圆融。',
    advice: ['增强危机意识', '不可过于安逸', '培养进取心', '控制饮食健康'],
  },
  伤官: {
    name: '伤官',
    shortName: '伤',
    strengths: ['才华横溢', '颠覆创新', '批判思维', '表达能力强', '艺术天赋', '个性鲜明', '创新与改革'],
    weaknesses: ['桀骜不驯', '口舌招祸', '不服管教', '自视甚高', '得罪人多', '心高气傲', '只关注结果', '追求完美'],
    relationships: '魅力争议型，吸引追随者，权威天敌。要么极受欢迎，要么极遭排斥。',
    emotionalStyle: '灵魂伴侣追求，精神操控欲，情感暴风雨。感情中追求完美，对伴侣要求极高。',
    conflictTriggers: ['遭遇权威压制', '创作受限时', '才华被忽视时'],
    health: ['注意心脏系统', '易有口腔问题', '情绪波动大', '需防心理疾病'],
    handlingStyle: '特立独行，标新立异，不按常规出牌，喜欢挑战权威, 不满足与现状，善于找到问题所在。',
    advice: ['学会尊重他人', '收敛锋芒', '多听少说', '控制情绪'],
  },
  比肩: {
    name: '比肩',
    shortName: '比',
    strengths: ['独立自强', '执行高效', '重信守诺', '意志坚定', '自尊心强', '有担当', '有责任感'],
    weaknesses: ['固执己见', '不懂变通', '拒绝帮助', '孤军奋战', '不善合作', '刚愎自用', '关注自己比较多'],
    relationships: '平等互助型，兄弟闺蜜情谊，排斥依附。与同辈关系好，但竞争意识强。',
    emotionalStyle: '伙伴式恋情，AA制拥护者，浪漫迟钝。婚姻讲究平等，不甘示弱。',
    conflictTriggers: ['被干涉决策', '要求依赖时', '被小看时'],
    health: ['注意肝胆系统', '易有筋骨问题', '过劳伤身', '需防肌肉劳损'],
    handlingStyle: '独立自主，亲力亲为，不愿求人，凡事靠自己，有问题自己扛。',
    advice: ['学会团队合作', '适当借助外力', '不必事事亲为', '学会倾听'],
  },
  劫财: {
    name: '劫财',
    shortName: '劫',
    strengths: ['行动迅猛', '江湖义气', '群体动员', '敢闯敢拼', '社交能力强', '有号召力'],
    weaknesses: ['冲动莽撞', '耗财惹祸', '法律意识淡', '争强好胜', '易被利用', '破财多'],
    relationships: '帮派凝聚型，为兄弟两肋插刀，但容易被利用。朋友多但良莠不齐。',
    emotionalStyle: '激烈占有欲，多角关系，快餐爱情。感情中争强好胜，易有三角恋情。',
    conflictTriggers: ['兄弟受欺辱', '利益分配时', '被人背叛时'],
    health: ['注意呼吸系统', '易有意外伤害', '因争斗受伤', '需防血光之灾'],
    handlingStyle: '雷厉风行，敢想敢干，做事风风火火，但容易冲动行事。',
    advice: ['三思而后行', '慎重交友', '理财需谨慎', '控制冲动'],
  },
};

// 十神职业参考数据（依据八字奇书整理）
export const TEN_GOD_CAREERS: Record<string, TenGodCareer> = {
  正官: {
    name: '正官',
    coreAbilities: ['制度构建', '流程优化', '风险评估', '组织管理', '规范执行'],
    traditionalCareers: ['法官', '审计师', '公务员', '教师', '秘书'],
    modernCareers: ['区块链合规官', 'ESG咨询师', '企业法务'],
    suitableRoles: ['管理岗位', '政府机关', '法律行业', '财务审计', '人事行政'],
    unsuitableRoles: ['高风险投资', '自由创业', '娱乐演艺', '销售冲刺'],
  },
  七杀: {
    name: '七杀',
    coreAbilities: ['破局攻坚', '极限操作', '战略威慑', '危机处理', '开疆拓土'],
    traditionalCareers: ['特种兵', '急诊医生', '竞技教练', '警察', '外科医生'],
    modernCareers: ['危机公关专家', '元宇宙安全官', '战略投资总监'],
    suitableRoles: ['开拓型岗位', '军警武职', '竞技体育', '外科手术', '创业开荒'],
    unsuitableRoles: ['文职行政', '客服接待', '后勤保障', '安稳闲职'],
  },
  正印: {
    name: '正印',
    coreAbilities: ['知识传承', '心灵疗愈', '文化沉淀', '教育培训', '精神引导'],
    traditionalCareers: ['教授', '心理咨询师', '非遗传承人', '医生', '僧道'],
    modernCareers: ['知识付费导师', '数字博物馆策划', '心理疏导师'],
    suitableRoles: ['教育行业', '医疗卫生', '文化传承', '宗教事务', '心理咨询'],
    unsuitableRoles: ['商业竞争', '销售业务', '股票投机', '高压岗位'],
  },
  偏印: {
    name: '偏印',
    coreAbilities: ['尖端研发', '玄学预测', '模式破解', '深度研究', '另类创新'],
    traditionalCareers: ['密码学家', '法医', '占星师', '中医', '侦探'],
    modernCareers: ['量子计算研究员', 'NFT鉴定师', '数据科学家'],
    suitableRoles: ['科研机构', '技术研发', '玄学命理', '刑侦法医', '冷门领域'],
    unsuitableRoles: ['人际应酬', '团队协作', '客户服务', '常规行政'],
  },
  正财: {
    name: '正财',
    coreAbilities: ['成本控制', '精细管理', '抗周期运营', '财务核算', '稳健理财'],
    traditionalCareers: ['精算师', '供应链总监', '仓储管理', '会计', '出纳'],
    modernCareers: ['共享经济调度官', '碳交易核算员', '财务数字化专家'],
    suitableRoles: ['财务岗位', '仓储物流', '成本核算', '银行柜员', '稳定收入型'],
    unsuitableRoles: ['高风险投资', '创意设计', '自由职业', '销售提成型'],
  },
  偏财: {
    name: '偏财',
    coreAbilities: ['资源杠杆', '风口捕捉', '流量变现', '人脉整合', '商机把握'],
    traditionalCareers: ['投行经理', '娱乐经纪', '房产中介', '贸易商', '古董商'],
    modernCareers: ['元宇宙地产商', '虚拟偶像操盘手', '网红孵化器'],
    suitableRoles: ['投资行业', '贸易商务', '娱乐经纪', '销售提成型', '中介服务'],
    unsuitableRoles: ['固定薪资', '行政文员', '技术研发', '稳定型岗位'],
  },
  食神: {
    name: '食神',
    coreAbilities: ['美学创造', '感官体验', '情绪价值', '艺术审美', '生活品质'],
    traditionalCareers: ['米其林厨师', '园艺师', '绘本作家', '画家', '歌手'],
    modernCareers: ['沉浸式剧本杀设计', '感官疗愈师', '美食博主'],
    suitableRoles: ['餐饮美食', '艺术创作', '休闲娱乐', '园林设计', '文艺表演'],
    unsuitableRoles: ['高压竞争', '军警武职', '财务审计', '政治博弈'],
  },
  伤官: {
    name: '伤官',
    coreAbilities: ['颠覆创新', '批判解构', '艺术表达', '专业技术', '言语辩论'],
    traditionalCareers: ['专利律师', '时事评论家', '先锋艺术家', '演说家', '外科医生'],
    modernCareers: ['DAO社区意见领袖', '元宇宙策展人', '自媒体大V'],
    suitableRoles: ['创意行业', '法律诉讼', '技术专家', '自媒体', '批评评论'],
    unsuitableRoles: ['传统体制', '服从型岗位', '按部就班', '人事行政'],
  },
  比肩: {
    name: '比肩',
    coreAbilities: ['单兵作战', '技术深耕', '耐力执行', '独立完成', '专注专业'],
    traditionalCareers: ['外科医生', '竞技运动员', '非遗工匠', '技师', '手艺人'],
    modernCareers: ['无人机飞手', '3D打印工程师', '独立开发者'],
    suitableRoles: ['技术岗位', '专业领域', '竞技体育', '独立作业', '手工艺人'],
    unsuitableRoles: ['合作型项目', '社交应酬', '团队领导', '公关接待'],
  },
  劫财: {
    name: '劫财',
    coreAbilities: ['快速响应', '地推执行', '群体动员', '开拓市场', '冲锋陷阵'],
    traditionalCareers: ['消防员', '搏击教练', '建筑工头', '推销员', '项目经理'],
    modernCareers: ['直播供应链团长', '极限运动教练', '社群运营'],
    suitableRoles: ['销售业务', '项目开拓', '体力劳动', '团队带头', '应急岗位'],
    unsuitableRoles: ['财务管理', '稳定文职', '精细核算', '长期规划'],
  },
};

/**
 * 根据十神名称获取性格特征
 */
export const getTenGodCharacteristics = (tenGodName: string): TenGodCharacteristics | null => {
  return TEN_GOD_CHARACTERISTICS[tenGodName] || null;
};

/**
 * 根据十神名称获取职业参考
 */
export const getTenGodCareer = (tenGodName: string): TenGodCareer | null => {
  return TEN_GOD_CAREERS[tenGodName] || null;
};

/**
 * 根据十神类型索引获取名称
 */
export const TEN_GOD_NAMES_MAP: Record<number, string> = {
  0: '比肩',
  1: '劫财',
  2: '食神',
  3: '伤官',
  4: '偏财',
  5: '正财',
  6: '七杀',
  7: '正官',
  8: '偏印',
  9: '正印',
};

/**
 * 十神有根/无根的命理表现
 * 依据传统命理学资料整理
 */
export const TEN_GOD_ROOT_MEANINGS: Record<string, { rooted: string; unrooted: string; injured: string }> = {
  比肩: {
    rooted: '自身身体健康，意志坚定，自信，能得同辈帮助',
    unrooted: '意志薄弱，缺乏自信，难得同辈助力',
    injured: '身体易有问题，同辈关系受阻，独立能力受损',
  },
  劫财: {
    rooted: '行动力强，竞争意识旺盛，朋友多',
    unrooted: '缺乏竞争力，朋友缘薄，合作意识弱',
    injured: '易因朋友破财，竞争中受挫，兄弟不和',
  },
  食神: {
    rooted: '才华横溢，表达能力强，想法能落实为实际行动',
    unrooted: '才华难以发挥，表达受阻，创意难实现',
    injured: '口舌招祸，创作受阻，生活品质下降',
  },
  伤官: {
    rooted: '艺术天赋高，创新能力强，个性鲜明',
    unrooted: '创新受限，才华难展，表达不畅',
    injured: '锋芒易伤人，才华受压制，与权威冲突',
  },
  正财: {
    rooted: '财有源头，为人稳重，求财有道，经济状况相对稳定',
    unrooted: '财运不稳，理财能力弱，收入波动大',
    injured: '财源受损，经济不稳，投资易亏',
  },
  偏财: {
    rooted: '横财运佳，投资眼光好，善于把握商机',
    unrooted: '偏财难得，投机易失，财来财去',
    injured: '投资失利，意外破财，贪念易惹祸',
  },
  正官: {
    rooted: '主贵，事业心强，有管理能力，遵纪守法，有责任感',
    unrooted: '仕途不顺，权威不足，管理能力弱',
    injured: '官非缠身，事业受阻，名誉受损',
  },
  七杀: {
    rooted: '魄力强，抗压能力好，适合开拓创业',
    unrooted: '缺乏魄力，容易退缩，难以突破',
    injured: '小人侵害，压力过大，意外灾祸',
  },
  正印: {
    rooted: '学识扎实，长辈缘分深，心态平和',
    unrooted: '学业不顺，长辈缘薄，缺乏庇护',
    injured: '学业受阻，长辈有病灾，精神压力大',
  },
  偏印: {
    rooted: '思维深邃，悟性高，适合研究性工作',
    unrooted: '思想孤僻，难得贵人，研究难成',
    injured: '思维混乱，学术受阻，与长辈不和',
  },
};
