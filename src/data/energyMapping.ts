
import { EnergyMapping } from '@/types/index';

export const energyMap: Record<string, EnergyMapping> = {
  // 四吉星 - 天医 (财富 & 婚姻)
  '13': { name: '天医1', type: 'lucky', level: 1, description: '财富 & 婚姻', baseScore: 100 },
  '31': { name: '天医1', type: 'lucky', level: 1, description: '财富 & 婚姻', baseScore: 100 },
  '68': { name: '天医2', type: 'lucky', level: 2, description: '财富 & 婚姻', baseScore: 75 },
  '86': { name: '天医2', type: 'lucky', level: 2, description: '财富 & 婚姻', baseScore: 75 },
  '49': { name: '天医3', type: 'lucky', level: 3, description: '财富 & 婚姻', baseScore: 50 },
  '94': { name: '天医3', type: 'lucky', level: 3, description: '财富 & 婚姻', baseScore: 50 },
  '27': { name: '天医4', type: 'lucky', level: 4, description: '财富 & 婚姻', baseScore: 25 },
  '72': { name: '天医4', type: 'lucky', level: 4, description: '财富 & 婚姻', baseScore: 25 },
  
  // 延年 (事业 & 健康)
  '19': { name: '延年1', type: 'lucky', level: 1, description: '事业 & 健康', baseScore: 100 },
  '91': { name: '延年1', type: 'lucky', level: 1, description: '事业 & 健康', baseScore: 100 },
  '78': { name: '延年2', type: 'lucky', level: 2, description: '事业 & 健康', baseScore: 75 },
  '87': { name: '延年2', type: 'lucky', level: 2, description: '事业 & 健康', baseScore: 75 },
  '34': { name: '延年3', type: 'lucky', level: 3, description: '事业 & 健康', baseScore: 50 },
  '43': { name: '延年3', type: 'lucky', level: 3, description: '事业 & 健康', baseScore: 50 },
  '26': { name: '延年4', type: 'lucky', level: 4, description: '事业 & 健康', baseScore: 25 },
  '62': { name: '延年4', type: 'lucky', level: 4, description: '事业 & 健康', baseScore: 25 },
  
  // 生气 (贵人 & 人脉)
  '14': { name: '生气1', type: 'lucky', level: 1, description: '贵人 & 人脉', baseScore: 100 },
  '41': { name: '生气1', type: 'lucky', level: 1, description: '贵人 & 人脉', baseScore: 100 },
  '67': { name: '生气2', type: 'lucky', level: 2, description: '贵人 & 人脉', baseScore: 75 },
  '76': { name: '生气2', type: 'lucky', level: 2, description: '贵人 & 人脉', baseScore: 75 },
  '39': { name: '生气3', type: 'lucky', level: 3, description: '贵人 & 人脉', baseScore: 50 },
  '93': { name: '生气3', type: 'lucky', level: 3, description: '贵人 & 人脉', baseScore: 50 },
  '28': { name: '生气4', type: 'lucky', level: 4, description: '贵人 & 人脉', baseScore: 25 },
  '82': { name: '生气4', type: 'lucky', level: 4, description: '贵人 & 人脉', baseScore: 25 },
  
  // 伏位 (耐力 & 持续)
  '11': { name: '伏位1', type: 'lucky', level: 1, description: '耐力 & 持续', baseScore: 100 },
  '22': { name: '伏位2', type: 'lucky', level: 2, description: '耐力 & 持续', baseScore: 75 },
  '88': { name: '伏位2', type: 'lucky', level: 2, description: '耐力 & 持续', baseScore: 75 },
  '99': { name: '伏位2', type: 'lucky', level: 2, description: '耐力 & 持续', baseScore: 75 },
  '66': { name: '伏位3', type: 'lucky', level: 3, description: '耐力 & 持续', baseScore: 50 },
  '77': { name: '伏位3', type: 'lucky', level: 3, description: '耐力 & 持续', baseScore: 50 },
  '33': { name: '伏位4', type: 'lucky', level: 4, description: '耐力 & 持续', baseScore: 25 },
  '44': { name: '伏位4', type: 'lucky', level: 4, description: '耐力 & 持续', baseScore: 25 },
  
  // 四凶星 - 绝命 (投资 & 情绪)
  '12': { name: '绝命1', type: 'unlucky', level: 1, description: '投资 & 情绪', baseScore: 100 },
  '21': { name: '绝命1', type: 'unlucky', level: 1, description: '投资 & 情绪', baseScore: 100 },
  '69': { name: '绝命2', type: 'unlucky', level: 2, description: '投资 & 情绪', baseScore: 75 },
  '96': { name: '绝命2', type: 'unlucky', level: 2, description: '投资 & 情绪', baseScore: 75 },
  '48': { name: '绝命3', type: 'unlucky', level: 3, description: '投资 & 情绪', baseScore: 50 },
  '84': { name: '绝命3', type: 'unlucky', level: 3, description: '投资 & 情绪', baseScore: 50 },
  '37': { name: '绝命4', type: 'unlucky', level: 4, description: '投资 & 情绪', baseScore: 25 },
  '73': { name: '绝命4', type: 'unlucky', level: 4, description: '投资 & 情绪', baseScore: 25 },
  
  // 祸害 (口才 & 疾病)
  '17': { name: '祸害1', type: 'unlucky', level: 1, description: '口才 & 疾病', baseScore: 100 },
  '71': { name: '祸害1', type: 'unlucky', level: 1, description: '口才 & 疾病', baseScore: 100 },
  '89': { name: '祸害2', type: 'unlucky', level: 2, description: '口才 & 疾病', baseScore: 75 },
  '98': { name: '祸害2', type: 'unlucky', level: 2, description: '口才 & 疾病', baseScore: 75 },
  '46': { name: '祸害3', type: 'unlucky', level: 3, description: '口才 & 疾病', baseScore: 50 },
  '64': { name: '祸害3', type: 'unlucky', level: 3, description: '口才 & 疾病', baseScore: 50 },
  '23': { name: '祸害4', type: 'unlucky', level: 4, description: '口才 & 疾病', baseScore: 25 },
  '32': { name: '祸害4', type: 'unlucky', level: 4, description: '口才 & 疾病', baseScore: 25 },
  
  // 五鬼 (智慧 & 灵性)
  '18': { name: '五鬼1', type: 'unlucky', level: 1, description: '智慧 & 灵性', baseScore: 100 },
  '81': { name: '五鬼1', type: 'unlucky', level: 1, description: '智慧 & 灵性', baseScore: 100 },
  '79': { name: '五鬼2', type: 'unlucky', level: 2, description: '智慧 & 灵性', baseScore: 75 },
  '97': { name: '五鬼2', type: 'unlucky', level: 2, description: '智慧 & 灵性', baseScore: 75 },
  '36': { name: '五鬼3', type: 'unlucky', level: 3, description: '智慧 & 灵性', baseScore: 50 },
  '63': { name: '五鬼3', type: 'unlucky', level: 3, description: '智慧 & 灵性', baseScore: 50 },
  '24': { name: '五鬼4', type: 'unlucky', level: 4, description: '智慧 & 灵性', baseScore: 25 },
  '42': { name: '五鬼4', type: 'unlucky', level: 4, description: '智慧 & 灵性', baseScore: 25 },
  
  // 六煞 (情商 & 桃花)
  '16': { name: '六煞1', type: 'unlucky', level: 1, description: '情商 & 桃花', baseScore: 100 },
  '61': { name: '六煞1', type: 'unlucky', level: 1, description: '情商 & 桃花', baseScore: 100 },
  '47': { name: '六煞2', type: 'unlucky', level: 2, description: '情商 & 桃花', baseScore: 75 },
  '74': { name: '六煞2', type: 'unlucky', level: 2, description: '情商 & 桃花', baseScore: 75 },
  '38': { name: '六煞3', type: 'unlucky', level: 3, description: '情商 & 桃花', baseScore: 50 },
  '83': { name: '六煞3', type: 'unlucky', level: 3, description: '情商 & 桃花', baseScore: 50 },
  '29': { name: '六煞4', type: 'unlucky', level: 4, description: '情商 & 桃花', baseScore: 25 },
  '92': { name: '六煞4', type: 'unlucky', level: 4, description: '情商 & 桃花', baseScore: 25 },
};
