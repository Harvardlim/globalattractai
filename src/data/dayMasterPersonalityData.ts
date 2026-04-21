// 日主性格与沟通数据
// 基于传统八字命理学

export interface DayMasterPersonality {
  stem: string;           // 天干
  polarity: '阳' | '阴';  // 阴阳
  element: string;        // 五行
  nickname: string;       // 别称
  elementTraits: string;  // 五行总体性情
  strengths: string[];    // 优势/优点
  weaknesses: string[];   // 提醒/缺点
  career: {
    suitable: string[];   // 适合职业
    unsuitable: string[]; // 不适合职业
    advice: string;       // 职业建议
  };
  relationship: {
    style: string;        // 感情风格
    strengths: string[];  // 感情优点
    challenges: string[]; // 感情挑战
    idealPartner: string; // 理想伴侣
    advice: string;       // 婚姻建议
  };
  health: {
    focus: string[];      // 健康关注点（通用）
    maleFocus?: string[];  // 男命专属健康关注点
    femaleFocus?: string[]; // 女命专属健康关注点
    advice: string;       // 健康建议
    maleAdvice?: string;  // 男命专属建议
    femaleAdvice?: string; // 女命专属建议
  };
  communication: {
    approach: string;     // 沟通方式
    tips: string[];       // 沟通技巧
    avoid: string[];      // 沟通禁忌
  };
}

export const DAY_MASTER_PERSONALITIES: Record<string, DayMasterPersonality> = {
  '甲': {
    stem: '甲',
    polarity: '阳',
    element: '木',
    nickname: '高大的乔木',
    elementTraits: '木代表仁，性直，情和。有慈悲恻隐之心，性子虽直但最终不会吵架，底层平和。',
    strengths: ['性格仁慈', '宽厚温和', '大方仁义', '威武坚强'],
    weaknesses: ['容易自负', '清高', '不合群', '过于直率'],
    career: {
      suitable: ['企业高管', '创业者', '建筑师', '园林设计', '教育管理', '律师', '政府官员', '医生'],
      unsuitable: ['需要圆滑应酬的销售', '服务行业基层', '需要委曲求全的岗位'],
      advice: '适合独立性强、有决策权的领导岗位，能够发挥其正直坚定的特质。'
    },
    relationship: {
      style: '责任担当型',
      strengths: ['有责任心', '重承诺', '保护欲强', '给予安全感'],
      challenges: ['不善表达情感', '过于强势', '忽视伴侣感受', '工作优先'],
      idealPartner: '温柔体贴、善解人意、能够包容其直率的伴侣',
      advice: '学会放下身段，多倾听伴侣心声，用行动表达爱意而非只是承诺。'
    },
    health: {
      focus: ['肝胆系统', '筋骨关节', '头部'],
      maleFocus: ['前列腺'],
      femaleFocus: ['经期不调'],
      advice: '注意疏肝理气，避免过度劳累和情绪郁结，多做伸展运动。'
    },
    communication: {
      approach: '直接坦诚型',
      tips: [
        '说话直接明了，不要绕弯子',
        '尊重其主见，给予充分的空间',
        '用事实和逻辑说服，避免情绪化',
        '认可其能力和成就'
      ],
      avoid: [
        '不要试图控制或压制',
        '避免在公众场合批评',
        '不要用小聪明或套路'
      ]
    }
  },
  '乙': {
    stem: '乙',
    polarity: '阴',
    element: '木',
    nickname: '藤蔓花草之木',
    elementTraits: '木代表仁，性直，情和。有慈悲恻隐之心，性子虽直但最终不会吵架，底层平和。',
    strengths: ['外柔内刚', '温顺坚忍', '情感丰富', '多情多义'],
    weaknesses: ['任性固执', '钻牛角尖', '不够自信', '依赖性强'],
    career: {
      suitable: ['文学创作', '艺术设计', '心理咨询', '教师', '护理', '花艺师', '美容美发', '时尚行业'],
      unsuitable: ['高压竞争环境', '需要强势决断的管理岗', '体力劳动'],
      advice: '适合需要细腻情感和艺术感的工作，在团队中发挥协调润滑作用。'
    },
    relationship: {
      style: '细腻浪漫型',
      strengths: ['温柔体贴', '善解人意', '浪漫多情', '忠诚专一'],
      challenges: ['过于敏感', '容易受伤', '依赖心强', '缺乏安全感'],
      idealPartner: '成熟稳重、能给予安全感、欣赏其细腻的伴侣',
      advice: '建立独立人格，不要过度依赖伴侣，学会自我疗愈和情绪管理。'
    },
    health: {
      focus: ['肝气郁结', '神经系统', '手足筋络'],
      femaleFocus: ['妇科气滞', '乳腺'],
      advice: '保持心情舒畅，避免钻牛角尖，适当运动疏通经络。'
    },
    communication: {
      approach: '温和委婉型',
      tips: [
        '语气温和，给予情感支持',
        '耐心倾听其想法和感受',
        '循序渐进，不要急于求成',
        '多给予鼓励和肯定'
      ],
      avoid: [
        '不要过于强硬或施压',
        '避免冷漠忽视其感受',
        '不要在其犹豫时催促决定'
      ]
    }
  },
  '丙': {
    stem: '丙',
    polarity: '阳',
    element: '火',
    nickname: '太阳之火',
    elementTraits: '火代表礼，性急，情恭。有礼貌，火热向上，热情乐观，急躁，自尊心强。',
    strengths: ['精力充沛', '迅速麻利', '开朗热情', '大方耿直'],
    weaknesses: ['暴躁性急', '刚猛冲动', '性情不稳定'],
    career: {
      suitable: ['演艺明星', '主持人', '销售精英', '市场营销', '公关活动', '运动员', '餐饮行业', '能源电力'],
      unsuitable: ['需要耐心细致的文职', '长期独处的研究工作', '压抑沉闷的环境'],
      advice: '适合需要热情感染力和表现力的工作，在聚光灯下发挥最佳。'
    },
    relationship: {
      style: '热情奔放型',
      strengths: ['热情主动', '浪漫大方', '乐观开朗', '给予快乐'],
      challenges: ['来得快去得快', '脾气火爆', '缺乏耐心', '容易厌倦'],
      idealPartner: '沉稳冷静、能包容其脾气、不计较的伴侣',
      advice: '控制脾气，学会冷静处理矛盾，保持感情的持续热度而非三分钟热情。'
    },
    health: {
      focus: ['心脏血管', '眼睛视力', '血压'],
      advice: '注意控制情绪，避免过度亢奋，保护心脏和眼睛健康。'
    },
    communication: {
      approach: '热情直接型',
      tips: [
        '保持热情积极的态度',
        '快速进入正题，不要拖沓',
        '给予正面反馈和认可',
        '配合其节奏和能量'
      ],
      avoid: [
        '不要冷淡或敷衍',
        '避免长时间的沉默',
        '不要在其激动时火上浇油'
      ]
    }
  },
  '丁': {
    stem: '丁',
    polarity: '阴',
    element: '火',
    nickname: '灯烛之火',
    elementTraits: '火代表礼，性急，情恭。有礼貌，火热向上，热情乐观，急躁，自尊心强。',
    strengths: ['内在热情', '奉献精神', '内敛文雅', '思虑缜密'],
    weaknesses: ['易有疑心', '耍小脾气', '有小心机'],
    career: {
      suitable: ['作家编辑', '心理分析', '策划顾问', '室内设计', '珠宝鉴定', '中医养生', '教育培训', '科研'],
      unsuitable: ['需要强势表现的销售', '高强度体力工作', '过于嘈杂的环境'],
      advice: '适合需要深度思考和细腻洞察的工作，在幕后发挥智慧。'
    },
    relationship: {
      style: '含蓄深情型',
      strengths: ['用心付出', '细心体贴', '忠贞不渝', '默默奉献'],
      challenges: ['多疑敏感', '爱吃醋', '容易胡思乱想', '情绪起伏'],
      idealPartner: '真诚坦荡、能给予安心、懂得其心思的伴侣',
      advice: '减少猜疑，坦诚沟通，不要把心事藏在心里，信任是感情的基础。'
    },
    health: {
      focus: ['心脏功能', '小肠消化', '失眠多梦'],
      advice: '注意养心安神，避免过度思虑，保持规律作息。'
    },
    communication: {
      approach: '细腻体贴型',
      tips: [
        '注意细节和情感表达',
        '真诚对待，不要敷衍',
        '给予私密的沟通空间',
        '关注其内心真实想法'
      ],
      avoid: [
        '不要忽视其敏感情绪',
        '避免过于粗犷直接',
        '不要让其感到被忽视'
      ]
    }
  },
  '戊': {
    stem: '戊',
    polarity: '阳',
    element: '土',
    nickname: '城墙之土',
    elementTraits: '土代表信，性重，情厚。真诚踏实，为人温厚守信，靠谱踏实，言出必行。',
    strengths: ['胸怀宽大', '稳重诚信', '严谨踏实', '落地能力强'],
    weaknesses: ['思维传统', '变通性弱', '自尊心强', '重名誉'],
    career: {
      suitable: ['房地产开发', '建筑工程', '银行金融', '政府公务员', '农业企业', '物流仓储', '人力资源', '项目管理'],
      unsuitable: ['需要灵活变通的创意工作', '高风险投机行业', '快节奏多变的岗位'],
      advice: '适合稳定、有规模、需要诚信经营的行业，在大平台发挥稳健优势。'
    },
    relationship: {
      style: '稳重可靠型',
      strengths: ['踏实可靠', '有担当', '重家庭', '给予安全感'],
      challenges: ['不解风情', '过于严肃', '缺乏浪漫', '固执己见'],
      idealPartner: '温柔贤惠、持家有道、懂得欣赏其踏实的伴侣',
      advice: '适当制造浪漫惊喜，学会表达爱意，不要把感情当成责任和义务。'
    },
    health: {
      focus: ['脾胃消化', '肌肉皮肤', '四肢'],
      advice: '注意饮食规律，避免过度劳累，保持适度运动。'
    },
    communication: {
      approach: '稳重务实型',
      tips: [
        '说话稳重，逻辑清晰',
        '重视承诺，言行一致',
        '给予足够的尊重和面子',
        '用实际案例和数据说话'
      ],
      avoid: [
        '不要轻浮或开玩笑过度',
        '避免朝令夕改',
        '不要触碰其底线和原则'
      ]
    }
  },
  '己': {
    stem: '己',
    polarity: '阴',
    element: '土',
    nickname: '耕地之土',
    elementTraits: '土代表信，性重，情厚。真诚踏实，为人温厚守信，靠谱踏实，言出必行。',
    strengths: ['性情温厚', '厚道坦诚', '包容含蓄', '适应力强'],
    weaknesses: ['易茫然', '易妥协', '主见不足'],
    career: {
      suitable: ['行政助理', '客服专员', '社工', '幼教', '餐饮服务', '农业种植', '后勤保障', '档案管理'],
      unsuitable: ['需要强势决策的管理岗', '高压竞争环境', '需要独立开拓的销售'],
      advice: '适合服务型、支持型工作，在团队中发挥润物细无声的作用。'
    },
    relationship: {
      style: '包容奉献型',
      strengths: ['温柔包容', '任劳任怨', '顾家体贴', '好相处'],
      challenges: ['容易委屈自己', '不敢表达需求', '缺乏主见', '易被忽视'],
      idealPartner: '有主见、能做决定、懂得珍惜其付出的伴侣',
      advice: '学会表达自己的需求，不要一味迁就，建立平等互尊的关系。'
    },
    health: {
      focus: ['脾胃虚弱', '消化吸收', '湿气'],
      advice: '注意健脾祛湿，避免寒凉食物，保持心情愉快。'
    },
    communication: {
      approach: '包容理解型',
      tips: [
        '态度温和，给予耐心',
        '帮助其理清思路和方向',
        '给予明确的建议和指引',
        '多倾听少评判'
      ],
      avoid: [
        '不要施加太大压力',
        '避免让其做复杂决定',
        '不要利用其好说话的性格'
      ]
    }
  },
  '庚': {
    stem: '庚',
    polarity: '阳',
    element: '金',
    nickname: '刀剑兵器之金',
    elementTraits: '金代表义，性刚，情烈。刚直不阿、不卑不亢、干脆刚毅，有义气有担当。',
    strengths: ['坚强豪爽', '讲义气', '刚毅果决', '公正侠义'],
    weaknesses: ['好胜心强', '顽固', '粗心', '易情绪化'],
    career: {
      suitable: ['军警执法', '外科医生', '机械制造', '钢铁冶金', '体育竞技', '投资决策', '法官检察官', '健身教练'],
      unsuitable: ['需要委婉圆滑的公关', '服务行业基层', '需要耐心细致的文职'],
      advice: '适合需要果断决策和执行力的工作，在竞争环境中脱颖而出。'
    },
    relationship: {
      style: '霸道直接型',
      strengths: ['有担当', '保护欲强', '说到做到', '敢爱敢恨'],
      challenges: ['大男子主义', '不善温柔', '控制欲强', '脾气暴躁'],
      idealPartner: '温柔似水、能以柔克刚、懂得退让的伴侣',
      advice: '学会温柔表达，控制脾气和控制欲，尊重伴侣的独立空间。'
    },
    health: {
      focus: ['肺部呼吸', '大肠功能', '皮肤毛发'],
      advice: '注意保护呼吸系统，避免过度劳累和情绪波动。'
    },
    communication: {
      approach: '直接爽快型',
      tips: [
        '说话干脆利落，不拖泥带水',
        '讲道理讲义气，以理服人',
        '展现真诚和坦荡',
        '尊重其决定和立场'
      ],
      avoid: [
        '不要虚伪或耍心眼',
        '避免软弱或优柔寡断',
        '不要在原则问题上讨价还价'
      ]
    }
  },
  '辛': {
    stem: '辛',
    polarity: '阴',
    element: '金',
    nickname: '首饰珠宝之金',
    elementTraits: '金代表义，性刚，情烈。刚直不阿、不卑不亢、干脆刚毅，有义气有担当。',
    strengths: ['柔软细腻', '亲切细致', '助人为乐', '有表现力'],
    weaknesses: ['自尊心强', '好面子', '好虚荣', '易华而不实'],
    career: {
      suitable: ['珠宝设计', '奢侈品销售', '美容美妆', '时尚编辑', '财务会计', '品质检测', '牙科医生', '精密仪器'],
      unsuitable: ['粗犷的体力劳动', '脏乱的工作环境', '需要粗放管理的岗位'],
      advice: '适合精致、有品味、注重细节的工作，在优雅环境中发挥特长。'
    },
    relationship: {
      style: '精致挑剔型',
      strengths: ['懂得经营', '注重仪式感', '品味高雅', '善于打扮'],
      challenges: ['要求过高', '爱挑剔', '物质需求强', '面子第一'],
      idealPartner: '有品味、有经济实力、懂得宠爱的伴侣',
      advice: '降低对伴侣的物质要求，看重内在品质，真心比面子更重要。'
    },
    health: {
      focus: ['肺气不足', '皮肤过敏', '牙齿口腔'],
      advice: '注意润肺养阴，保护皮肤，避免过度追求完美带来的压力。'
    },
    communication: {
      approach: '优雅得体型',
      tips: [
        '注意措辞，保持礼貌得体',
        '适当给予赞美和认可',
        '在私下场合提出批评',
        '尊重其品味和审美'
      ],
      avoid: [
        '不要当众让其难堪',
        '避免粗鲁或不雅的言行',
        '不要忽视其付出和贡献'
      ]
    }
  },
  '壬': {
    stem: '壬',
    polarity: '阳',
    element: '水',
    nickname: '江河湖海之水',
    elementTraits: '水代表智，性聪，情善。灵活变通，聪明多智，有谋略，信息敏感度强。',
    strengths: ['足智多谋', '有勇有谋', '处理灵活', '有冲劲'],
    weaknesses: ['易狡诈', '易钻营', '不够踏实', '易感性'],
    career: {
      suitable: ['贸易商务', '物流运输', '旅游导游', '记者媒体', '投资分析', '情报咨询', '水利工程', '航运航海'],
      unsuitable: ['需要固定不变的文职', '需要耐心等待的岗位', '过于保守的行业'],
      advice: '适合需要灵活应变和流动性的工作，在变化中寻找机会。'
    },
    relationship: {
      style: '自由洒脱型',
      strengths: ['风趣幽默', '懂得浪漫', '给予自由', '不拘小节'],
      challenges: ['花心善变', '不够专一', '承诺感弱', '难以定性'],
      idealPartner: '独立自主、不粘人、给予空间的伴侣',
      advice: '学会专一和承诺，不要把自由当借口，稳定的感情需要用心经营。'
    },
    health: {
      focus: ['肾脏膀胱', '腰部'],
      maleFocus: ['泌尿系统', '前列腺'],
      femaleFocus: ['妇科系统', '子宫卵巢'],
      advice: '注意保护肾脏，避免过度劳累和房事，保持规律作息。',
      maleAdvice: '男性需特别注意泌尿系统和前列腺保养。',
      femaleAdvice: '女性需特别注意妇科保养，定期检查。'
    },
    communication: {
      approach: '灵活机变型',
      tips: [
        '思维敏捷，跟上其节奏',
        '展现智慧和见解',
        '给予新鲜有趣的话题',
        '保持开放和灵活的态度'
      ],
      avoid: [
        '不要固执己见或守旧',
        '避免沉闷无趣的交流',
        '不要试图限制其自由'
      ]
    }
  },
  '癸': {
    stem: '癸',
    polarity: '阴',
    element: '水',
    nickname: '山泉小雨之水',
    elementTraits: '水代表智，性聪，情善。灵活变通，聪明多智，有谋略，信息敏感度强。',
    strengths: ['稳重宁静', '有耐心', '思维细腻', '润物无声'],
    weaknesses: ['多幻想', '感情易脆弱', '魄力不足', '易悲观'],
    career: {
      suitable: ['心理咨询', '占卜玄学', '护理照顾', '茶艺师', '水疗养生', '科研助理', '图书馆员', '幕后策划'],
      unsuitable: ['需要强势表现的销售', '高压竞争环境', '需要快速决断的管理'],
      advice: '适合安静、需要耐心和细腻的工作，在幕后默默发挥影响力。'
    },
    relationship: {
      style: '柔情似水型',
      strengths: ['温柔体贴', '善解人意', '默默付出', '感情细腻'],
      challenges: ['过于被动', '容易受伤', '优柔寡断', '缺乏魄力'],
      idealPartner: '阳光积极、有主见、能带领方向的伴侣',
      advice: '主动表达感情，不要总是等待，增强自信，相信自己值得被爱。'
    },
    health: {
      focus: ['肾气不足', '耳朵听力'],
      maleFocus: ['泌尿系统'],
      femaleFocus: ['妇科虚寒', '白带异常'],
      advice: '注意补肾养阴，避免过度悲观和情绪低落，保持心情平和。',
      maleAdvice: '男性注意泌尿系统保养，避免久坐。',
      femaleAdvice: '女性注意子宫保暖，避免寒凉。'
    },
    communication: {
      approach: '温柔细水型',
      tips: [
        '语气轻柔，给予安全感',
        '耐心倾听其内心世界',
        '给予情感支持和理解',
        '创造安静舒适的沟通环境'
      ],
      avoid: [
        '不要粗暴或急躁',
        '避免负面消极的话题',
        '不要忽视其情绪变化'
      ]
    }
  }
};

// 获取日主性格数据
export const getDayMasterPersonality = (dayGan: string): DayMasterPersonality | null => {
  return DAY_MASTER_PERSONALITIES[dayGan] || null;
};

// 五行颜色映射
export const ELEMENT_COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  '木': { text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  '火': { text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  '土': { text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  '金': { text: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  '水': { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
};
