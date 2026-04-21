export interface EnergyStarInfo {
  id: string;
  name: string;
  abbreviation: string;
  type: 'lucky' | 'unlucky';
  combinations: string[];
  theme: string;
  personality: {
    traits: string[];
    strengths: string[];
    weaknesses: string[];
    communication: string;
  };
  health: {
    bodyParts: string[];
    risks: string[];
    advice: string;
  };
  lifePath: {
    career: string[];
    relationships: string;
    direction: string;
    advice: string;
  };
}

export const luckyStars: EnergyStarInfo[] = [
  {
    id: 'tianyi',
    name: '天医',
    abbreviation: 'TY',
    type: 'lucky',
    combinations: ['13', '31', '68', '86', '49', '94', '27', '72'],
    theme: '财富与婚姻',
    personality: {
      traits: ['天性聪慧', '心地善良', '善解人意', '乐于助人', '真诚待人', '心胸开阔'],
      strengths: [
        '具备开发智慧和学习能力',
        '能成大事，象征天上的医神、守护神',
        '财运和事业运佳',
        '好婚姻、好运势'
      ],
      weaknesses: [
        '由于过分的善良和开明，容易被人欺骗',
        '过度相信他人',
        '容易心软'
      ],
      communication: '真诚温和，善于倾听和理解他人，是很好的倾诉对象'
    },
    health: {
      bodyParts: ['心血管系统', '血压调节'],
      risks: ['高血压', '低血压', '心血管疾病'],
      advice: '定期检查血压，保持心情平和，适量运动有助于心血管健康'
    },
    lifePath: {
      career: ['医疗行业', '中医养生', '金融理财', '教育培训', '心理咨询', '慈善公益'],
      relationships: '重视家庭和谐，追求稳定长久的感情关系，是理想的婚姻伴侣',
      direction: '稳健积累财富，发挥智慧优势，在助人领域成就事业',
      advice: '学会保护自己，在善良的同时保持适度警惕，避免被人利用'
    }
  },
  {
    id: 'yannian',
    name: '延年',
    abbreviation: 'YN',
    type: 'lucky',
    combinations: ['19', '91', '78', '87', '34', '43', '26', '62'],
    theme: '事业与健康',
    personality: {
      traits: ['具有领导能力', '负责任', '勇于承担', '心胸宽广', '有正义感', '同情心强'],
      strengths: [
        '经常成为领导者',
        '喜欢为弱者辩护',
        '通常长寿',
        '有影响力'
      ],
      weaknesses: [
        '延年过多，工作会变得很累',
        '女性19、87数字过多容易成为女强人，标准过高难找伴侣',
        '容易给自己和他人压力'
      ],
      communication: '权威而有说服力，善于激励他人，但有时过于严厉'
    },
    health: {
      bodyParts: ['神经系统', '精神状态'],
      risks: ['精神压力过大', '神经衰弱', '失眠'],
      advice: '学会放松，合理分配工作与休息时间，培养解压的兴趣爱好'
    },
    lifePath: {
      career: ['企业管理', '行政领导', '金融储蓄', '法律行业', '军警部门', '专业顾问'],
      relationships: '在感情中容易成为主导方，需要学会放手和信任伴侣',
      direction: '发挥领导才能，在专业领域深耕，建立长久稳定的事业',
      advice: '注意劳逸结合，不要过度追求完美，学会适当放权和休息'
    }
  },
  {
    id: 'shengqi',
    name: '生气',
    abbreviation: 'SQ',
    type: 'lucky',
    combinations: ['14', '41', '67', '76', '39', '93', '28', '82'],
    theme: '贵人与人脉',
    personality: {
      traits: ['快乐乐观', '心胸宽广', '精力充沛', '情商高', '人缘好', '平易近人'],
      strengths: [
        '社交关系好，到处是笑容',
        '能交很多好朋友',
        '形成和谐甜蜜的关系',
        '给他人带来快乐'
      ],
      weaknesses: [
        '对任何事情都不太苛求，野心较少',
        '生气磁场过强会导致懒惰',
        '缺乏个人主见，容易满足现状',
        '抱着随遇而安的态度'
      ],
      communication: '热情友善，擅长活跃气氛，是社交场合的开心果'
    },
    health: {
      bodyParts: ['消化系统', '脾胃'],
      risks: ['胃病', '消化不良', '脾胃虚弱'],
      advice: '饮食规律，少吃生冷刺激食物，保持良好的饮食习惯'
    },
    lifePath: {
      career: ['服务业', '公关行业', '销售营销', '娱乐行业', '旅游行业', '社区工作'],
      relationships: '容易遇到贵人，人缘极佳，但需注意不要过于随意对待感情',
      direction: '利用人脉优势，在服务和沟通领域发展，成为连接他人的桥梁',
      advice: '培养目标意识和上进心，不要过于安于现状，要有自己的追求'
    }
  },
  {
    id: 'fuwei',
    name: '伏位',
    abbreviation: 'FW',
    type: 'lucky',
    combinations: ['11', '22', '33', '44', '66', '77', '88', '99'],
    theme: '耐力与坚持',
    personality: {
      traits: ['超乎常人的耐心', '毅力强', '安静内敛', '潜力巨大', '稳重可靠'],
      strengths: [
        '能够获得和抓住机会真正发现自己',
        '虽然安静但有很大潜力让每个人都对成功感到惊讶',
        '坚持不懈',
        '厚积薄发'
      ],
      weaknesses: [
        '等待时间过长，错失良机',
        '不敢冒险',
        '犹豫不决',
        '过于保守被动'
      ],
      communication: '话不多但句句在理，是值得信赖的倾听者'
    },
    health: {
      bodyParts: ['心脏', '循环系统'],
      risks: ['心脏病', '循环系统问题', '久坐相关疾病'],
      advice: '增加运动量，不要久坐，定期进行心脏健康检查'
    },
    lifePath: {
      career: ['研究工作', '技术开发', '手工艺术', '档案管理', '质检监察', '学术研究'],
      relationships: '感情发展较慢但稳定，一旦确定关系会非常忠诚',
      direction: '发挥耐心和毅力优势，在需要长期积累的领域深耕',
      advice: '学会把握时机，在适当时候勇敢出手，不要过于保守'
    }
  }
];

export const unluckyStars: EnergyStarInfo[] = [
  {
    id: 'jueming',
    name: '绝命',
    abbreviation: 'JM',
    type: 'unlucky',
    combinations: ['12', '21', '69', '96', '48', '84', '37', '73'],
    theme: '投资与情绪',
    personality: {
      traits: ['思维敏捷', '记忆力强', '很会赚钱', '目标明确', '野心很大', '判断力敏锐'],
      strengths: [
        '计划能力出色',
        '勇敢，愿意冒险，能获得意外利润',
        '财务、股票、基金、房地产都依赖绝命数字',
        '反应迅速，有不服输的精神'
      ],
      weaknesses: [
        '脾气暴躁，情绪不稳定',
        '容易惹上法律纠纷，容易得罪人',
        '爱憎分明，喜欢反叛',
        '过于自信，浪费，喜欢赌博，不善于储蓄'
      ],
      communication: '直接了当，说话不绕弯，但容易伤人'
    },
    health: {
      bodyParts: ['肾脏', '泌尿系统', '生殖系统'],
      risks: ['肾脏疾病', '糖尿病', '妇科问题', '泌尿系统疾病'],
      advice: '控制情绪，避免过度劳累和刺激性食物，定期检查肾功能'
    },
    lifePath: {
      career: ['投资理财', '股票交易', '房地产', '期货市场', '创业者', '竞技行业'],
      relationships: '感情强烈但起伏大，需要学会情绪管理，避免冲动决策',
      direction: '利用敏锐的商业嗅觉在投资领域发展，但需控制风险',
      advice: '学会储蓄和风险控制，避免赌博心态，情绪稳定是成功关键'
    }
  },
  {
    id: 'huohai',
    name: '祸害',
    abbreviation: 'HH',
    type: 'unlucky',
    combinations: ['17', '71', '89', '98', '46', '64', '23', '32'],
    theme: '沟通与疾病',
    personality: {
      traits: ['善于交谈', '交际聪明', '说话流利', '善于辩论', '靠嘴吃饭'],
      strengths: [
        '享受美食',
        '说话技巧带来财富',
        '适合销售等工作',
        '表达能力强'
      ],
      weaknesses: [
        '口舌之争多',
        '善于花言巧语',
        '喜欢炫耀，固执',
        '喜欢抱怨和计较小事，容易激怒他人'
      ],
      communication: '能说会道，但容易引起口舌之争，说话要三思'
    },
    health: {
      bodyParts: ['呼吸系统', '口腔', '咽喉'],
      risks: ['呼吸道疾病', '咽喉炎', '口腔问题'],
      advice: '注意保护呼吸系统，戒烟限酒，保持口腔卫生，少吃辛辣'
    },
    lifePath: {
      career: ['销售行业', '律师法务', '主持演讲', '培训讲师', '餐饮美食', '外交谈判'],
      relationships: '需要注意沟通方式，避免因言语问题影响感情',
      direction: '发挥口才优势，在需要表达和沟通的领域发展',
      advice: '说话前三思，减少抱怨和炫耀，学会倾听他人'
    }
  },
  {
    id: 'wugui',
    name: '五鬼',
    abbreviation: '5G',
    type: 'unlucky',
    combinations: ['18', '81', '79', '97', '36', '63', '24', '42'],
    theme: '智慧与灵性',
    personality: {
      traits: ['有才华', '聪明', '想法多', '充满创意', '善于外交', '学习能力强'],
      strengths: [
        '多领域有才华',
        '经常在重要时刻表现出人意料',
        '不断寻求创新和变化',
        '精于策略和计划'
      ],
      weaknesses: [
        '喜欢幻想，非常多疑',
        '缺乏安全感',
        '具有不稳定的特征，反复无常',
        '难以沟通，常人难以理解'
      ],
      communication: '思维跳跃，表达独特，需要对方有足够的理解力'
    },
    health: {
      bodyParts: ['心脏', '神经系统'],
      risks: ['心脏病', '神经性疾病', '意外事故', '失眠焦虑'],
      advice: '保持情绪稳定，注意安全防范，培养安全感，规律作息'
    },
    lifePath: {
      career: ['艺术创作', '宗教灵性', '科技创新', '电脑IT', '美容行业', '中西医结合'],
      relationships: '感情不稳定，需要找到能理解自己的伴侣',
      direction: '发挥创意和智慧，在艺术或科技创新领域寻找突破',
      advice: '建立安全感，学会信任他人，保持稳定的生活节奏'
    }
  },
  {
    id: 'liusha',
    name: '六煞',
    abbreviation: 'LS',
    type: 'unlucky',
    combinations: ['16', '61', '47', '74', '38', '83', '29', '92'],
    theme: '情商与桃花',
    personality: {
      traits: ['聪明适应性强', '社交能力强', '思维细腻', '情感丰富', '爱美', '充满魅力'],
      strengths: [
        '喜欢美的事物，对艺术有独特鉴赏能力',
        '喜欢打扮，很受异性欢迎',
        '初次见面时充满温暖，给人留下好印象',
        '沟通能力好'
      ],
      weaknesses: [
        '敏感易感动',
        '被情感困扰导致情绪不稳定',
        '优柔寡断',
        '在感情方面容易改变方向，为女性花钱'
      ],
      communication: '温柔细腻，善于营造氛围，但容易感情用事'
    },
    health: {
      bodyParts: ['皮肤', '胃部', '内分泌'],
      risks: ['皮肤问题', '胃病', '抑郁症', '癌症风险'],
      advice: '保持情绪稳定，注意皮肤保养和饮食健康，培养积极心态'
    },
    lifePath: {
      career: ['美容行业', '时尚设计', '艺术创作', '服务行业', '婚庆行业', '公关形象'],
      relationships: '桃花运旺但感情多变，需要学会专一和坚定',
      direction: '发挥审美和情商优势，在美学和人际相关领域发展',
      advice: '培养决断力，感情上要学会坚定选择，避免优柔寡断'
    }
  }
];

export const allStars = [...luckyStars, ...unluckyStars];
