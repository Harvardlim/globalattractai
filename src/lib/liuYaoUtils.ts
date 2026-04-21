// 六爻映射表 - 每个天干对应的6个地支位置
const LIU_YAO_MAP: Record<number, number[]> = {
  0: [0, 2, 4, 6, 8, 10], // 甲
  1: [7, 5, 3, 1, 11, 9], // 乙
  2: [4, 6, 8, 10, 0, 2], // 丙
  3: [5, 3, 1, 11, 9, 7], // 丁
  4: [2, 4, 6, 8, 10, 0], // 戊
  5: [3, 1, 11, 9, 7, 5], // 己
  6: [0, 2, 4, 6, 8, 10], // 庚
  7: [1, 11, 9, 7, 5, 3], // 辛
  8: [0, 2, 4, 6, 8, 10], // 壬
  9: [7, 5, 3, 1, 11, 9], // 癸
};

export const YAO_NAMES = ['一爻(平民)', '二爻(商贾)', '三爻(润滑剂)', '四爻(宰相)', '五爻(帝王)', '六爻(神仙)'];

export const YAO_TRAITS: Record<number, string> = {
  1: '善良、简单、低调、踏实、执行力强',
  2: '有钱、聪明、商务头脑、理性、善于管理',
  3: '灵活、情商高、人际关系好、可上可下',
  4: '规划能力强、中高层管理、执行落地',
  5: '有决策/管理能力、老板思维、战略眼光、格局大',
  6: '灵性、精神世界丰富、直觉敏锐、有自己的想法',
};

const PILLAR_MEANINGS: Record<string, Record<number, string>> = {
  '大目标': {
    1: '目标简单务实，不好高骛远，追求安稳的生活',
    2: '目标与财富、商业相关，追求经济上的成功',
    3: '目标灵活多变，追求人脉与关系的发展',
    4: '目标在于管理与规划，追求事业上的系统化发展',
    5: '目标远大，有领导者的格局，追求影响力与决策权',
    6: '目标偏向精神层面，追求灵性与内心的丰富',
  },
  '做事方式': {
    1: '做事踏实稳重，一步一个脚印，执行力强',
    2: '做事精明理性，善于权衡利弊，讲究效率与回报',
    3: '做事灵活圆滑，善于协调各方，情商高',
    4: '做事有规划、有条理，善于制定方案并执行落地',
    5: '做事大气果断，善于把控方向，具有战略眼光',
    6: '做事凭直觉感觉，有独到见解，不走寻常路',
  },
  '自己状态': {
    1: '内心朴实善良，为人低调踏实，不喜张扬',
    2: '内心注重利益得失，头脑灵活，善于经营',
    3: '内心灵活通透，善于察言观色，适应力强',
    4: '内心注重秩序与规划，思维缜密，做事有章法',
    5: '内心有领导欲望，格局大，有决断力',
    6: '内心世界丰富，有灵性，喜欢独处思考',
  },
  '最后结果': {
    1: '结果趋于平稳安定，虽不轰轰烈烈但踏实可靠',
    2: '结果与财富积累有关，善于守住成果',
    3: '结果取决于人际关系的经营，贵人运重要',
    4: '结果需要靠系统规划来实现，执行到位则可成',
    5: '结果可期，有望达到较高成就，但需注意守成',
    6: '结果偏精神收获，内心满足大于物质回报',
  },
};

export const getLiuYaoPosition = (ganIdx: number, zhiIdx: number): number => {
  const yaoMap = LIU_YAO_MAP[ganIdx];
  if (!yaoMap) return 0;
  const position = yaoMap.indexOf(zhiIdx);
  return position >= 0 ? position + 1 : 0;
};

export const YAO_PAIRS: Record<number, number> = {
  1: 4, 4: 1,
  2: 5, 5: 2,
  3: 6, 6: 3,
};

export interface LiuYaoAnalysis {
  yearYao: number;
  monthYao: number;
  dayYao: number;
  hourYao: number;
  summary: string[];
  personalityInsights: string[];
}

export const analyzeLiuYao = (pillars: { year: { ganIdx: number; zhiIdx: number }; month: { ganIdx: number; zhiIdx: number }; day: { ganIdx: number; zhiIdx: number }; hour: { ganIdx: number; zhiIdx: number } }): LiuYaoAnalysis => {
  const yearYao = getLiuYaoPosition(pillars.year.ganIdx, pillars.year.zhiIdx);
  const monthYao = getLiuYaoPosition(pillars.month.ganIdx, pillars.month.zhiIdx);
  const dayYao = getLiuYaoPosition(pillars.day.ganIdx, pillars.day.zhiIdx);
  const hourYao = getLiuYaoPosition(pillars.hour.ganIdx, pillars.hour.zhiIdx);

  const yaoPositions = [yearYao, monthYao, dayYao, hourYao];
  const labels = ['年柱', '月柱', '日柱', '时柱'];
  const meanings = ['大目标', '做事方式', '自己状态', '最后结果'];

  const summary: string[] = [];
  yaoPositions.forEach((yao, i) => {
    if (yao <= 0) return;
    const desc = PILLAR_MEANINGS[meanings[i]]?.[yao];
    if (desc) {
      summary.push(`${labels[i]}(${YAO_NAMES[yao - 1]}): ${desc}`);
    }
  });

  const personalityInsights: string[] = [];
  const allLow = yaoPositions.filter(y => y > 0).every(y => y <= 3);
  const allHigh = yaoPositions.filter(y => y > 0).every(y => y >= 4);
  if (allLow) personalityInsights.push('全部低爻位：务实、踏实、想法简单直接');
  if (allHigh) personalityInsights.push('全部高爻位：想法多、格局大，但容易飘');

  const validPositions = yaoPositions.filter(y => y > 0);
  const hasPair = validPositions.some((y1, i) =>
    validPositions.some((y2, j) => i !== j && YAO_PAIRS[y1] === y2)
  );
  if (!hasPair && validPositions.length > 1) {
    personalityInsights.push('无配对爻位：容易内耗、想法难落地');
  }

  return { yearYao, monthYao, dayYao, hourYao, summary, personalityInsights };
};
