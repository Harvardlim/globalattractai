/**
 * 奇门分析数据 - 基于《御定奇门宝鉴》
 * 用于分析命理盘中的健康、性格、行业倾向
 */

// 九星分析
export interface StarAnalysis {
  name: string;
  personality: string[];
  health: string[];
  industries: string[];
  element: string;
}

export const STAR_ANALYSIS: Record<string, StarAnalysis> = {
  '天蓬': {
    name: '天蓬星',
    element: '水',
    personality: ['智慧过人，深谋远虑', '善于隐藏真实想法', '心机较深，不易被看透', '适应能力强，善于变通'],
    health: ['注意肾脏、膀胱系统', '防范泌尿系统疾病', '冬季尤需保暖', '忌过度劳累伤肾'],
    industries: ['情报、调查行业', '水产、航运业', '酒水饮料业', '地下工程、矿业']
  },
  '天芮': {
    name: '天芮星',
    element: '土',
    personality: ['稳重踏实，务实勤恳', '有时过于保守固执', '善于照顾他人', '容易忧虑多思'],
    health: ['脾胃系统较弱', '注意消化系统保健', '易患皮肤病', '肌肉关节需注意'],
    industries: ['医疗卫生行业', '房地产、建筑业', '农业、畜牧业', '殡葬、保险业']
  },
  '天冲': {
    name: '天冲星',
    element: '木',
    personality: ['性格刚直，勇往直前', '做事果断，雷厉风行', '有时过于冲动', '正义感强，嫉恶如仇'],
    health: ['肝胆系统需注意', '容易肝火旺盛', '筋骨劳损风险', '春季养生尤为重要'],
    industries: ['军警、体育行业', '交通运输业', '机械制造业', '创业投资领域']
  },
  '天辅': {
    name: '天辅星',
    element: '木',
    personality: ['温文尔雅，知书达理', '善于教导，有耐心', '追求完美，注重细节', '文艺气质浓厚'],
    health: ['神经系统敏感', '易有失眠多梦', '注意颈椎保健', '肝脏排毒需关注'],
    industries: ['教育培训行业', '文化艺术领域', '出版传媒业', '咨询顾问业']
  },
  '天禽': {
    name: '天禽星',
    element: '土',
    personality: ['中正平和，处事公正', '包容性强，善于调解', '守中持正，不偏不倚', '稳定可靠，值得信赖'],
    health: ['脾胃为核心', '消化吸收功能', '注意饮食规律', '四季养生均需注意'],
    industries: ['政府机关单位', '中介服务业', '综合管理岗位', '协调统筹工作']
  },
  '天心': {
    name: '天心星',
    element: '金',
    personality: ['聪明睿智，思维敏捷', '善于谋划，深谋远虑', '有领导才能', '果断决策，执行力强'],
    health: ['肺部呼吸系统', '注意皮肤保养', '秋季需防燥', '大肠功能调理'],
    industries: ['医药卫生领域', '金融投资业', '法律政务业', '高科技研发']
  },
  '天柱': {
    name: '天柱星',
    element: '金',
    personality: ['口才了得，能言善辩', '有时言辞犀利', '善于表达和沟通', '批判性思维强'],
    health: ['口腔牙齿问题', '呼吸道易感染', '注意喉咙保健', '肺部需要保养'],
    industries: ['律师、讲师', '销售、公关业', '传媒广播业', '评论评估行业']
  },
  '天任': {
    name: '天任星',
    element: '土',
    personality: ['忠厚老实，任劳任怨', '责任心强，踏实肯干', '有时不善言辞', '持之以恒，韧性十足'],
    health: ['脾胃消化系统', '关节骨骼保健', '注意腰背问题', '肌肉劳损防范'],
    industries: ['房地产开发', '农业种植业', '基础建设业', '物流仓储业']
  },
  '天英': {
    name: '天英星',
    element: '火',
    personality: ['热情开朗，活力四射', '追求表现，喜欢被关注', '艺术天分高', '有时情绪波动较大'],
    health: ['心脏血管系统', '眼睛视力保护', '血压血脂关注', '夏季防中暑'],
    industries: ['文化演艺业', '广告设计业', '时尚美妆业', '餐饮烧烤业']
  }
};

// 八门分析
export interface DoorAnalysis {
  name: string;
  personality: string[];
  health: string[];
  industries: string[];
  element: string;
}

export const DOOR_ANALYSIS: Record<string, DoorAnalysis> = {
  '休门': {
    name: '休门',
    element: '水',
    personality: ['性格温和，善于休养生息', '懂得进退，知道什么时候该休息', '人际关系良好，贵人运佳'],
    health: ['肾脏泌尿系统', '注意水分代谢', '腰部保健重要', '冬季防寒保暖'],
    industries: ['休闲娱乐业', '旅游度假业', '养生保健业', '人力资源业']
  },
  '生门': {
    name: '生门',
    element: '土',
    personality: ['生机勃勃，创造力强', '善于开拓新领域', '财运亨通，有商业头脑', '乐观积极向上'],
    health: ['脾胃消化功能', '注意营养吸收', '肌肉发育良好', '饮食需规律'],
    industries: ['创业投资业', '房地产开发', '农业畜牧业', '金融理财业']
  },
  '伤门': {
    name: '伤门',
    element: '木',
    personality: ['性格刚烈，敢于冒险', '竞争意识强，好胜心重', '行动力强，雷厉风行', '有时过于冲动'],
    health: ['肝胆功能调理', '筋骨容易受伤', '注意运动损伤', '春季养肝护肝'],
    industries: ['军警安保业', '体育竞技业', '医疗外科业', '机械制造业']
  },
  '杜门': {
    name: '杜门',
    element: '木',
    personality: ['内敛含蓄，不善表达', '善于保守秘密', '独立性强，喜欢独处', '思维缜密深沉'],
    health: ['神经系统敏感', '容易抑郁焦虑', '注意情志调理', '肝气郁结风险'],
    industries: ['情报安全业', '科研技术业', '档案保密业', '地下工程业']
  },
  '景门': {
    name: '景门',
    element: '火',
    personality: ['热情奔放，表现欲强', '善于展示自我', '文采斐然，艺术天分', '有时过于张扬'],
    health: ['心脏血管系统', '眼睛视力问题', '血液循环关注', '夏季防暑降温'],
    industries: ['文化传媒业', '演艺娱乐业', '教育培训业', '广告策划业']
  },
  '死门': {
    name: '死门',
    element: '土',
    personality: ['沉稳冷静，不动声色', '善于等待时机', '执着坚定，不轻易放弃', '有时过于固执'],
    health: ['脾胃功能较弱', '消化系统问题', '关节僵硬风险', '新陈代谢缓慢'],
    industries: ['殡葬祭祀业', '考古研究业', '保险理赔业', '地质矿产业']
  },
  '惊门': {
    name: '惊门',
    element: '金',
    personality: ['口才出众，能言善辩', '反应敏捷，机智过人', '善于应对突发情况', '有时言多必失'],
    health: ['口腔牙齿问题', '呼吸道敏感', '神经紧张焦虑', '肺部需要保养'],
    industries: ['律师诉讼业', '新闻传媒业', '危机公关业', '销售推广业']
  },
  '开门': {
    name: '开门',
    element: '金',
    personality: ['开朗大方，领导力强', '善于开创事业', '有远见卓识', '处事公正果断'],
    health: ['肺部呼吸系统', '皮肤干燥问题', '大肠功能调理', '秋季防燥润肺'],
    industries: ['政府机关业', '企业管理层', '金融投资业', '高端服务业']
  }
};

// 八神分析
export interface GodAnalysis {
  name: string;
  personality: string[];
  health: string[];
  guidance: string[];
}

export const GOD_ANALYSIS: Record<string, GodAnalysis> = {
  '值符': {
    name: '值符',
    personality: ['贵人相助，逢凶化吉', '领导气质，威望较高', '做事有章法，受人尊重'],
    health: ['整体运势较好', '贵人助力健康', '心态平和为要'],
    guidance: ['适合担任领导岗位', '贵人运旺盛', '把握重要机遇']
  },
  '螣蛇': {
    name: '螣蛇',
    personality: ['思维活跃，想象丰富', '有时多疑多虑', '善于察言观色', '灵活变通'],
    health: ['注意精神状态', '容易失眠多梦', '神经衰弱风险', '心理健康关注'],
    guidance: ['从事创意行业', '注意防范小人', '保持心态稳定']
  },
  '太阴': {
    name: '太阴',
    personality: ['内敛低调，善于隐藏', '有暗中贵人相助', '善于策划谋略', '行事谨慎稳妥'],
    health: ['注意妇科健康', '阴虚体质调理', '情绪波动关注', '夜间休息重要'],
    guidance: ['适合幕后工作', '女性贵人较多', '低调行事有利']
  },
  '六合': {
    name: '六合',
    personality: ['人缘极佳，善于合作', '婚姻感情顺利', '商业合作有利', '中介协调能力强'],
    health: ['整体健康较好', '注意人际压力', '合作中保持界限'],
    guidance: ['适合合伙创业', '婚姻感情有利', '贸易中介行业']
  },
  '白虎': {
    name: '白虎',
    personality: ['性格刚烈，雷厉风行', '有时过于冲动', '权威性强', '敢于面对挑战'],
    health: ['注意意外伤害', '血光之灾防范', '筋骨容易受伤', '手术开刀风险'],
    guidance: ['适合军警行业', '注意安全防护', '控制冲动情绪']
  },
  '玄武': {
    name: '玄武',
    personality: ['智慧深沉，心思缜密', '有时城府较深', '善于洞察人心', '适应能力强'],
    health: ['肾脏泌尿系统', '注意水分代谢', '防范暗疾隐患', '定期体检重要'],
    guidance: ['适合调查研究', '防范欺诈风险', '保持正直诚信']
  },
  '九地': {
    name: '九地',
    personality: ['稳重踏实，脚踏实地', '包容性强，厚德载物', '善于积累沉淀', '有耐心和韧性'],
    health: ['脾胃消化系统', '关节骨骼保健', '下肢循环关注', '久坐需防范'],
    guidance: ['适合基础行业', '房产土地有利', '稳扎稳打发展']
  },
  '九天': {
    name: '九天',
    personality: ['志向远大，眼界开阔', '追求卓越，不甘平庸', '有时好高骛远', '创新意识强'],
    health: ['头部需要关注', '血压心脏保健', '高处作业注意', '情志宜平和'],
    guidance: ['适合高端行业', '航空航天有利', '追求卓越发展']
  }
};

// 宫位健康对应表（根据九宫对应身体部位）
export const PALACE_HEALTH_MAP: Record<number, { name: string; bodyParts: string[]; healthIssues: string[]; maleHealthIssues?: string[]; femaleHealthIssues?: string[] }> = {
  1: {
    name: '坎宫',
    bodyParts: ['肾脏', '耳朵', '腰部', '血液'],
    healthIssues: ['肾虚腰痛', '耳鸣耳聋', '血液循环'],
    maleHealthIssues: ['泌尿系统问题', '前列腺'],
    femaleHealthIssues: ['妇科寒湿', '子宫卵巢']
  },
  2: {
    name: '坤宫',
    bodyParts: ['脾胃', '腹部', '肌肉', '皮肤'],
    healthIssues: ['消化不良', '腹部疾病', '肌肉劳损', '皮肤问题'],
    femaleHealthIssues: ['妇科疾病']
  },
  3: {
    name: '震宫',
    bodyParts: ['肝脏', '胆囊', '筋骨', '足部'],
    healthIssues: ['肝胆疾病', '筋骨疼痛', '足部受伤', '神经紧张', '惊吓惊恐']
  },
  4: {
    name: '巽宫',
    bodyParts: ['肝胆', '股部', '神经', '呼吸道'],
    healthIssues: ['肝气郁结', '股部髋部问题', '神经衰弱', '风寒感冒', '过敏症']
  },
  5: {
    name: '中宫',
    bodyParts: ['脾胃', '消化系统', '五脏六腑'],
    healthIssues: ['脾胃失调', '消化吸收问题', '身体协调', '慢性疾病']
  },
  6: {
    name: '乾宫',
    bodyParts: ['头部', '肺部', '大肠', '骨骼'],
    healthIssues: ['头痛头晕', '呼吸系统疾病', '便秘肠道', '骨骼问题', '高血压']
  },
  7: {
    name: '兑宫',
    bodyParts: ['口腔', '牙齿', '肺部', '皮肤'],
    healthIssues: ['口腔牙齿问题', '呼吸道感染', '皮肤干燥', '咽喉疾病']
  },
  8: {
    name: '艮宫',
    bodyParts: ['脾胃', '手指', '背部', '关节'],
    healthIssues: ['手指关节痛', '背部劳损', '脾胃虚弱', '肿块结节']
  },
  9: {
    name: '离宫',
    bodyParts: ['心脏', '眼睛', '血管', '小肠'],
    healthIssues: ['心脏疾病', '视力问题', '血压血脂', '心血管疾病', '失眠多梦']
  }
};

// 健康问题类型
export interface HealthIssue {
  palace: number;
  palaceName: string;
  type: 'empty' | 'tomb' | 'xing';  // 空亡、入墓、击刑
  typeLabel: string;
  bodyParts: string[];
  healthIssues: string[];
  severity: 'warning' | 'caution';  // 警告级别
}

// 分析健康问题（根据空亡、入墓、击刑）
export const analyzeHealthIssues = (palaces: any[], gender?: '男' | '女'): HealthIssue[] => {
  const issues: HealthIssue[] = [];

  const getHealthIssues = (healthInfo: typeof PALACE_HEALTH_MAP[1]): string[] => {
    const base = [...healthInfo.healthIssues];
    if (gender === '男' && healthInfo.maleHealthIssues) {
      base.push(...healthInfo.maleHealthIssues);
    } else if (gender === '女' && healthInfo.femaleHealthIssues) {
      base.push(...healthInfo.femaleHealthIssues);
    }
    return base;
  };

  for (const palace of palaces) {
    const healthInfo = PALACE_HEALTH_MAP[palace.id];
    if (!healthInfo) continue;

    // 检查空亡
    if (palace.empty) {
      issues.push({
        palace: palace.id,
        palaceName: healthInfo.name,
        type: 'empty',
        typeLabel: '空亡',
        bodyParts: healthInfo.bodyParts,
        healthIssues: getHealthIssues(healthInfo),
        severity: 'warning'
      });
    }

    // 检查入墓（十二长生中有"墓"）
    if (palace.lifeStages && palace.lifeStages.includes('墓')) {
      issues.push({
        palace: palace.id,
        palaceName: healthInfo.name,
        type: 'tomb',
        typeLabel: '入墓',
        bodyParts: healthInfo.bodyParts,
        healthIssues: getHealthIssues(healthInfo),
        severity: 'caution'
      });
    }

    // 检查击刑（天盘干或地盘干有击刑）
    if (palace.skyStatus?.isXing || palace.earthStatus?.isXing || 
        palace.sky2Status?.isXing || palace.earth2Status?.isXing) {
      issues.push({
        palace: palace.id,
        palaceName: healthInfo.name,
        type: 'xing',
        typeLabel: '击刑',
        bodyParts: healthInfo.bodyParts,
        healthIssues: getHealthIssues(healthInfo),
        severity: 'warning'
      });
    }
  }

  return issues;
};

// 宫位性格特征（用于命宫分析）
export interface PalacePersonality {
  palace: number;
  name: string;
  traits: string[];
  careerAdvice: string[];
}

export const PALACE_PERSONALITY: Record<number, PalacePersonality> = {
  1: {
    palace: 1,
    name: '坎宫',
    traits: ['智慧通达，善于思考', '心思缜密，深谋远虑', '适应力强，善于变通', '有时过于多虑'],
    careerAdvice: ['适合智力工作', '研究分析领域', '水利环保行业', '咨询顾问工作']
  },
  2: {
    palace: 2,
    name: '坤宫',
    traits: ['温和厚道，包容性强', '勤劳踏实，任劳任怨', '善于照顾他人', '有时优柔寡断'],
    careerAdvice: ['适合服务行业', '房地产领域', '农业畜牧业', '教育护理工作']
  },
  3: {
    palace: 3,
    name: '震宫',
    traits: ['行动力强，雷厉风行', '敢于创新，开拓进取', '性格直爽，嫉恶如仇', '有时过于冲动'],
    careerAdvice: ['适合创业领域', '体育竞技行业', '交通运输业', '电子科技业']
  },
  4: {
    palace: 4,
    name: '巽宫',
    traits: ['文雅温和，善于沟通', '灵活变通，善于协调', '追求完美，注重细节', '有时犹豫不决'],
    careerAdvice: ['适合文化教育', '传媒出版业', '商贸流通业', '设计策划工作']
  },
  5: {
    palace: 5,
    name: '中宫',
    traits: ['中正平和，稳定可靠', '善于协调，包容万象', '核心位置，掌控全局', '责任心强'],
    careerAdvice: ['适合管理岗位', '中介协调工作', '综合服务业', '核心决策层']
  },
  6: {
    palace: 6,
    name: '乾宫',
    traits: ['有领导才能，威严刚健', '决策果断，执行力强', '追求成功，有远大志向', '有时过于强势'],
    careerAdvice: ['适合领导岗位', '政府机关工作', '金融投资业', '高端服务业']
  },
  7: {
    palace: 7,
    name: '兑宫',
    traits: ['口才了得，善于表达', '开朗乐观，人缘较好', '善于交际，情商较高', '有时言多必失'],
    careerAdvice: ['适合销售行业', '演讲培训业', '餐饮服务业', '公关传媒业']
  },
  8: {
    palace: 8,
    name: '艮宫',
    traits: ['稳重踏实，脚踏实地', '善于积累，厚积薄发', '有耐心和毅力', '有时过于保守'],
    careerAdvice: ['适合房地产业', '采矿地质业', '建筑工程业', '文物收藏业']
  },
  9: {
    palace: 9,
    name: '离宫',
    traits: ['热情开朗，表现欲强', '文采斐然，艺术天分', '善于展示，追求卓越', '有时情绪波动'],
    careerAdvice: ['适合文化艺术', '教育培训业', '传媒广告业', '时尚设计业']
  }
};

// 获取命宫（日柱天干落在哪个宫位）
// 特殊规则：甲隐遁于值符，日干为甲时命宫为值符所在宫位
export const getMingGongPalace = (palaces: any[], dayGan: string): any | null => {
  // 甲隐遁于值符，日干为甲时，命宫为值符所在宫位
  if (dayGan === '甲') {
    return palaces.find(p => p.god === '值符') || null;
  }
  
  // 其他天干：在九宫中查找日柱天干所在的宫位
  // 日柱天干可能出现在天盘干(skyStem/skyStem2)或地盘干(earthStem/earthStem2)
  // 命宫以天盘干为准
  for (const palace of palaces) {
    if (palace.skyStem === dayGan || palace.skyStem2 === dayGan) {
      return palace;
    }
  }
  // 如果天盘没找到，检查地盘干
  for (const palace of palaces) {
    if (palace.earthStem === dayGan || palace.earthStem2 === dayGan) {
      return palace;
    }
  }
  return null;
};

// 综合分析函数
export interface QimenAnalysisResult {
  mingGongPalace: any | null; // 命宫（日干落宫）
  mainStar: StarAnalysis | null;
  mainDoor: DoorAnalysis | null;
  mainGod: GodAnalysis | null;
  palaceTraits: PalacePersonality | null;
  healthIssues: HealthIssue[];  // 基于空亡、入墓、击刑的健康问题
  personalitySummary: string[];
  industrySummary: string[];
}

export const analyzeQimenChart = (palaces: any[], dayGan?: string, gender?: '男' | '女'): QimenAnalysisResult => {
  // 找到日干落宫（命宫）
  const mingGongPalace = dayGan ? getMingGongPalace(palaces, dayGan) : null;
  
  // 分析健康问题（基于空亡、入墓、击刑）
  const healthIssues = analyzeHealthIssues(palaces, gender);
  
  if (!mingGongPalace) {
    return {
      mingGongPalace: null,
      mainStar: null,
      mainDoor: null,
      mainGod: null,
      palaceTraits: null,
      healthIssues,
      personalitySummary: [],
      industrySummary: []
    };
  }

  const mainStar = STAR_ANALYSIS[mingGongPalace.star] ?? null;
  const mainDoor = DOOR_ANALYSIS[mingGongPalace.door] ?? null;
  const mainGod = GOD_ANALYSIS[mingGongPalace.god] ?? null;
  const palaceTraits = PALACE_PERSONALITY[mingGongPalace.id] ?? null;

  // 综合性格特点
  const personalitySummary: string[] = [];
  if (palaceTraits) personalitySummary.push(...palaceTraits.traits.slice(0, 2));
  if (mainStar) personalitySummary.push(...mainStar.personality.slice(0, 2));
  if (mainDoor) personalitySummary.push(...mainDoor.personality.slice(0, 2));

  // 综合行业建议
  const industrySummary: string[] = [];
  if (palaceTraits) industrySummary.push(...palaceTraits.careerAdvice);
  if (mainStar) industrySummary.push(...mainStar.industries.slice(0, 2));
  if (mainDoor) industrySummary.push(...mainDoor.industries.slice(0, 2));

  return {
    mingGongPalace,
    mainStar,
    mainDoor,
    mainGod,
    palaceTraits,
    healthIssues,
    personalitySummary: [...new Set(personalitySummary)],
    industrySummary: [...new Set(industrySummary)]
  };
};
