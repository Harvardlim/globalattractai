import { FourPillars, PalaceData, ChartData, ChartType, StemStatus, Gender } from '@/types';
import { 
  HEAVENLY_STEMS, EARTHLY_BRANCHES, STARS, DOORS, GODS, PALACE_INFO, BRANCH_PALACE_MAP,
  LIFE_STAGES, STEM_CHANG_SHENG_START, STEM_DIRECTION, PALACE_BRANCHES,
  PALACE_ELEMENTS, DOOR_ELEMENTS, Element, LUO_SHU_RING, OPPOSITE_PALACES
} from './constants';
import { getFourPillars, calculateCycles, getZodiac } from './ganzhiHelper';
import { getLunarDate } from './lunar';

const mod9 = (n: number): number => {
  const r = n % 9;
  return r === 0 ? 9 : r;
};

// 入墓逻辑
const checkMu = (stemIdx: number, palaceId: number, god: string, xunShou: string): boolean => {
  if (stemIdx === 1 && palaceId === 6) return true;  // 乙
  if (stemIdx === 2 && palaceId === 6) return true;  // 丙
  if (stemIdx === 3 && palaceId === 8) return true;  // 丁
  if (stemIdx === 4 && palaceId === 6) return true;  // 戊
  if (stemIdx === 4 && palaceId === 2 && god === '值符' && xunShou == '甲子戊') return true;  // 戊
  if (stemIdx === 5 && palaceId === 2 && god === '值符' && xunShou == '甲戌己') return true;  // 己
  if (stemIdx === 6 && palaceId === 2 && god === '值符' && xunShou == '甲申庚') return true;  // 庚
  if (stemIdx === 7 && palaceId === 2 && god === '值符' && xunShou == '甲午辛') return true;  // 辛
  if (stemIdx === 8 && palaceId === 2 && god === '值符' && xunShou == '甲辰壬') return true;  // 壬
  if (stemIdx === 5 && palaceId === 8) return true;  // 己
  if (stemIdx === 6 && palaceId === 8) return true;  // 庚
  if (stemIdx === 7 && palaceId === 4) return true;  // 辛
  if (stemIdx === 8 && palaceId === 4) return true;  // 壬
  if (stemIdx === 9 && palaceId === 2) return true;  // 癸
  return false;
};

// 击刑逻辑
const checkXing = (stemIdx: number, palaceId: number): boolean => {
  if (stemIdx === 4 && palaceId === 3) return true; // 戊
  if (stemIdx === 5 && palaceId === 2) return true; // 己
  if (stemIdx === 6 && palaceId === 8) return true; // 庚
  if (stemIdx === 7 && palaceId === 9) return true; // 辛
  if (stemIdx === 8 && palaceId === 4) return true; // 壬
  if (stemIdx === 9 && palaceId === 4) return true; // 癸
  return false;
};

// 门迫逻辑
const isGateCompel = (doorName: string, palaceId: number): boolean => {
  if (!doorName) return false;
  const dIdx = DOORS.indexOf(doorName);
  if (dIdx === -1) return false;
  const doorEl = DOOR_ELEMENTS[dIdx];
  const palaceEl = PALACE_ELEMENTS[palaceId];
  if (doorEl === Element.METAL && palaceEl === Element.WOOD) return true;
  if (doorEl === Element.WOOD && palaceEl === Element.EARTH) return true;
  if (doorEl === Element.EARTH && palaceEl === Element.WATER) return true;
  if (doorEl === Element.WATER && palaceEl === Element.FIRE) return true;
  if (doorEl === Element.FIRE && palaceEl === Element.METAL) return true;
  return false;
};

const getLifeStages = (stem: string, palaceId: number): string[] => {
  const sIdx = HEAVENLY_STEMS.indexOf(stem);
  if (sIdx === -1) return [];
  const startBranch = STEM_CHANG_SHENG_START[sIdx];
  const direction = STEM_DIRECTION[sIdx];
  const branches = PALACE_BRANCHES[palaceId] ?? [];
  
  return branches.map(branch => {
    const steps = direction === 1 
        ? (branch - startBranch + 12) % 12 
        : (startBranch - branch + 12) % 12;
    return LIFE_STAGES[steps];
  });
};

export const generateChart = (date: Date, type: ChartType, name: string = 'User', gender: Gender = Gender.MALE, issue: string = ''): ChartData => {

// 晚子
const hour = date.getHours();
const isLateZi = hour === 23;
const calcDate = isLateZi ? new Date(date.getTime() + 60 * 60 * 1000) : date; 

// 2. Get Four Pillars
const pillars = getFourPillars(date); 

// 3. Get Lunar info based on the adjusted date
const { month: lunarMonth, day: lunarDay } = getLunarDate(calcDate);

// 4. Calculate Ju Number (Method: Traditional "Zhi Run" or "Chai Bu")
const yNum = pillars.year.zhiIdx + 1;
const hNum = pillars.hour.zhiIdx + 1;
const sum = yNum + lunarMonth + lunarDay + hNum;
const juNum = mod9(sum);


// 5. Yin/Yang toggle should ideally be based on the nearest Solar Term (Jie Qi)
// If dayOfYear is 172 (approx Summer Solstice), it flips to Yin.
const startOfYear = new Date(date.getFullYear(), 0, 0);
const diff = date.getTime() - startOfYear.getTime();
const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
const yinYang = (dayOfYear >= 172 && dayOfYear < 355) ? 'Yin' : 'Yang';

let palaces: PalaceData[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1, name: PALACE_INFO[i + 1].name, position: PALACE_INFO[i + 1].position,
  bagua: PALACE_INFO[i + 1].name, earthStem: '', skyStem: '', hiddenStem: '',
  door: '', star: '', god: '', empty: false, horse: false, lifeStages: [],
  skyStatus: { isMu: false, isXing: false },
  earthStatus: { isMu: false, isXing: false },
  isMenPo: false
}));

const stems = [4, 5, 6, 7, 8, 9, 3, 2, 1]; // 戊己庚辛壬癸丁丙乙
const earthMap: Record<number, number> = {}; 
let curr = juNum;
stems.forEach(sIdx => {
  earthMap[curr] = sIdx;
  curr = (yinYang === 'Yang') ? mod9(curr + 1) : mod9(curr - 1);
});

palaces.forEach(p => {
  p.earthStem = HEAVENLY_STEMS[earthMap[p.id]];
  if (p.id === 2 && earthMap[5] !== undefined) {
    p.earthStem2 = HEAVENLY_STEMS[earthMap[5]]; 
  }
});

const gap = (pillars.hour.zhiIdx - pillars.hour.ganIdx + 12) % 12;
const leaderMap: Record<number, number> = { 0:4, 10:5, 8:6, 6:7, 4:8, 2:9 };
const leaderStemIdx = leaderMap[gap];
const leaderPid = parseInt(Object.keys(earthMap).find(k => earthMap[parseInt(k)] === leaderStemIdx)!);

// 值符
const zhiFuStarHome = leaderPid === 5 ? 2 : leaderPid;
// 值符星
const zhiFuStar = STARS[PALACE_INFO[zhiFuStarHome].defaultStarIdx];
// 值符门
const zhiShiDoor = DOORS[PALACE_INFO[zhiFuStarHome].defaultDoorIdx];


let shiGanIdx = pillars.hour.ganIdx;
if (pillars.hour.gan === '甲') shiGanIdx = leaderStemIdx;
const shiGanPid = parseInt(Object.keys(earthMap).find(k => earthMap[parseInt(k)] === shiGanIdx)!);
const targetPid = shiGanPid === 5 ? 2 : shiGanPid;
const sourcePid = leaderPid === 5 ? 2 : leaderPid;

// 天盘
const skyShift = (LUO_SHU_RING.indexOf(targetPid) - LUO_SHU_RING.indexOf(sourcePid) + 8) % 8;
palaces.forEach(p => {
  if (p.id === 5) return;
  const ringIdx = LUO_SHU_RING.indexOf(p.id);
  const originIdx = (ringIdx - skyShift + 8) % 8;
  const originPid = LUO_SHU_RING[originIdx];
  
  p.star = STARS[PALACE_INFO[originPid].defaultStarIdx];
  p.skyStem = HEAVENLY_STEMS[earthMap[originPid]];
  if (originPid === 2 && earthMap[5] !== undefined) {
      p.skyStem2 = HEAVENLY_STEMS[earthMap[5]]; 
  }

  const godIdxRaw = (ringIdx - LUO_SHU_RING.indexOf(targetPid) + 8) % 8;
  const godIdx = (yinYang === 'Yang') ? godIdxRaw : (8 - godIdxRaw) % 8;
  p.god = GODS[godIdx];
});

const stepsToTarget = (pillars.hour.zhiIdx - gap + 12) % 12;
let zhiShiPid = leaderPid;
for (let i = 0; i < stepsToTarget; i++) {
  zhiShiPid = (yinYang === 'Yang') ? mod9(zhiShiPid + 1) : mod9(zhiShiPid - 1);
}

// 值使
const zhiShiPidFinal = zhiShiPid === 5 ? 2 : zhiShiPid;

const doorShift = (LUO_SHU_RING.indexOf(zhiShiPidFinal) - LUO_SHU_RING.indexOf(sourcePid) + 8) % 8;
palaces.forEach(p => {
  if (p.id === 5) return;
  const ringIdx = LUO_SHU_RING.indexOf(p.id);
  const originIdx = (ringIdx - doorShift + 8) % 8;
  const originPid = LUO_SHU_RING[originIdx];
  const doorIdx = PALACE_INFO[originPid].defaultDoorIdx;
  if (doorIdx !== -1) p.door = DOORS[doorIdx];
});

// 值符
const zhiFu = palaces.find(p => p.id === 2).god

// 暗干逻辑
// 判断伏吟：门和星都在自己原本的宫位
const isStemFuYin = palaces.filter(p => p.id !== 5).every(p => {
  const defaultStar = STARS[PALACE_INFO[p.id].defaultStarIdx];
  const defaultDoorIdx = PALACE_INFO[p.id].defaultDoorIdx;
  const starHome = p.star === defaultStar;
  const doorHome = defaultDoorIdx === -1 ? true : p.door === DOORS[defaultDoorIdx];
  return starHome && doorHome;
});

// 旬首名称（如：甲子戊、甲申庚）
const xunNames = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
const leaderStems = [4, 5, 6, 7, 8, 9]; // 戊己庚辛壬癸
const xunIdx = leaderStems.indexOf(leaderStemIdx);
const xunShou = xunIdx !== -1 ? xunNames[xunIdx] + HEAVENLY_STEMS[leaderStemIdx] : HEAVENLY_STEMS[leaderStemIdx];

// 查值符入墓击刑
const getStemStatus = (stem: string, palaceId: number): StemStatus => {
  const idx = HEAVENLY_STEMS.indexOf(stem);
  return {
    isMu: checkMu(idx, palaceId, zhiFu, xunShou),
    isXing: checkXing(idx, palaceId)
  };
};

// 判断是否为甲时
const isJiaHour = pillars.hour.gan === '甲';

// 特殊处理：暗干伏吟局或甲时
if ((isStemFuYin && isJiaHour) || isStemFuYin ) {
  // 确定中宫的暗干
  let centerStem: string;
  
const xunIdx = leaderStems.indexOf(leaderStemIdx);
centerStem = HEAVENLY_STEMS[leaderStems[xunIdx]];

// Store both the center stem value and hidden palaces
const centerStemValue = centerStem; // Preserve the string value
const hiddenPalaces: Record<number, string> = {};

// If you need an object that contains both pieces of information:
hiddenPalaces; // Assign hidden palaces to center palace

// Or if you want to store the center stem in hiddenPalaces:
hiddenPalaces[5] = centerStemValue; // Store center stem as hidden stem in palace 5

  // 确定起始宫和旋转方向
  const startPalaceId = 5; // 从中宫开始
  // const direction = yinYang === 'Yang' ? 1 : -1;
  
  // 定义飞宫顺序（洛书顺序）
  const luoShuOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4];
  
  // 找到中宫在洛书顺序中的位置
  const centerIndex = luoShuOrder.indexOf(startPalaceId);
  
  // 按照阳顺阴逆飞宫排列暗干
  let stemOrder: number[] = [];
  
  const Idx: number = xunIdx; // 戊(0)己(1)庚(2)辛(3)壬(4)癸(5)
  stemOrder = [];


  // 标准顺序 戊己庚辛壬癸丁丙乙 暗干
  const stemOrderMap = [
    { Yin: [8,7,6,5,4,1,2,3,9], Yang: [9,3,2,1,4,5,6,7,8] },      // 0: 戊 [4]
    { Yin: [9,8,7,6,5,4,1,2,3], Yang: [3,2,1,4,5,6,7,8,9] },      // 1: 己 [5]
    { Yin: [3,9,8,7,6,5,4,1,2], Yang: [2,1,4,5,6,7,8,9,3] },      // 2: 庚 [6]
    { Yin: [2,3,9,8,7,6,5,4,1], Yang: [1,4,5,6,7,8,9,3,2] },      // 3: 辛 [7]
    { Yin: [1,2,3,9,8,7,6,5,4], Yang: [4,5,6,7,8,9,3,2,1] },      // 4: 壬 [8]
    { Yin: [4,1,2,3,9,8,7,6,5], Yang: [5,6,7,8,9,3,2,1,4] }       // 5: 癸 [9] , 丁[3] 丙 [2] 乙 [1]
  ];

// Usage:
if (xunIdx >= 0 && xunIdx <= 5) {
  stemOrder = stemOrderMap[xunIdx][yinYang];
}

  
  // 按照飞宫顺序分配暗干
  for (let i = 0; i < 9; i++) {
   
    if (stemOrder[i] !== undefined) {
      hiddenPalaces[i + 1] = HEAVENLY_STEMS[stemOrder[i]];
    }
  }
  
  // 将暗干分配到各宫
  palaces.forEach(p => {
    if (p.id === 5) return; // 中宫不排暗干
    
    if (hiddenPalaces[p.id]) {
      p.hiddenStem = hiddenPalaces[p.id];
    }
    
    // 特殊处理：时干寄在坤二宫
    if (p.id === 2) {
      if (isJiaHour) {
        // 甲时：将旬首对应的暗干也放在坤二宫
        const xunIdx = leaderStems.indexOf(leaderStemIdx);
        const xunStem = HEAVENLY_STEMS[leaderStems[xunIdx]];
        p.hiddenStem += xunStem;
      } else {
        // 非甲时：将时干寄在坤二宫
        p.hiddenStem += pillars.hour.gan;
      }
    }
  });
} else {
  // 原来的暗干排列逻辑（保持不变）
  const ringShiGanIdx = LUO_SHU_RING.indexOf(shiGanPid === 5 ? 2 : shiGanPid);
  const ringZhiShiIdx = LUO_SHU_RING.indexOf(zhiShiPidFinal);
  const hiddenShift = (ringZhiShiIdx - ringShiGanIdx + 8) % 8;

  palaces.forEach(p => {
    if (p.id === 5) return;
    const ringIdx = LUO_SHU_RING.indexOf(p.id);
    const originIdx = (ringIdx - hiddenShift + 8) % 8;
    const originPid = LUO_SHU_RING[originIdx];
    p.hiddenStem = HEAVENLY_STEMS[earthMap[originPid]];
    if (originPid === 2 && earthMap[5] !== undefined) {
      p.hiddenStem += HEAVENLY_STEMS[earthMap[5]];
    }
  });
}


  const void1 = (gap + 10) % 12;
  const void2 = (void1 + 1) % 12;
  const hMap: Record<number, number> = { 0:2, 1:11, 2:8, 3:5, 4:2, 5:11, 6:8, 7:5, 8:2, 9:11, 10:8, 11:5 };
  const hBranch = hMap[pillars.hour.zhiIdx % 12];
  
  palaces.forEach(p => {
    if (p.id === BRANCH_PALACE_MAP[void1] || p.id === BRANCH_PALACE_MAP[void2]) p.empty = true;
    if (p.id === BRANCH_PALACE_MAP[hBranch]) p.horse = true;
    
    p.skyStatus = getStemStatus(p.skyStem, p.id);
    if (p.skyStem2) p.sky2Status = getStemStatus(p.skyStem2, p.id);
    p.earthStatus = getStemStatus(p.earthStem, p.id);
    if (p.earthStem2) p.earth2Status = getStemStatus(p.earthStem2, p.id);
    p.isMenPo = isGateCompel(p.door, p.id);
    
    // 计算每个天干在该宫的所有长生（四隅宫有2个地支，所以有2个长生）
    const skyStages = getLifeStages(p.skyStem, p.id);
    const sky2Stages = p.skyStem2 ? getLifeStages(p.skyStem2, p.id) : [];
    const earthStages = getLifeStages(p.earthStem, p.id);
    const earth2Stages = p.earthStem2 ? getLifeStages(p.earthStem2, p.id) : [];
    
    // 合并所有长生：[天干1长生们, 天干2长生们, 地干1长生们, 地干2长生们]
    p.lifeStages = [...skyStages, ...sky2Stages, ...earthStages, ...earth2Stages];
  });

  const { big, annual } = calculateCycles(date, gender, pillars);

  // 判断伏吟局：九星和八门都在本宫位置
  const isStarFuYin = palaces.filter(p => p.id !== 5).every(p => {
    const defaultStar = STARS[PALACE_INFO[p.id].defaultStarIdx];
    return p.star === defaultStar;
  });
  const isDoorFuYin = palaces.filter(p => p.id !== 5).every(p => {
    const defaultDoorIdx = PALACE_INFO[p.id].defaultDoorIdx;
    if (defaultDoorIdx === -1) return true; // 中宫无门
    return p.door === DOORS[defaultDoorIdx];
  });
  const isFuYin = isStarFuYin && isDoorFuYin;

  // 判断反吟局：九星或八门落到对冲宫（任一即为反吟）
  const isStarFanYin = palaces.filter(p => p.id !== 5).every(p => {
    const oppositePid = OPPOSITE_PALACES[p.id];
    const oppositeStar = STARS[PALACE_INFO[oppositePid].defaultStarIdx];
    return p.star === oppositeStar;
  });
  const isDoorFanYin = palaces.filter(p => p.id !== 5).every(p => {
    const oppositePid = OPPOSITE_PALACES[p.id];
    const oppositeDoorIdx = PALACE_INFO[oppositePid].defaultDoorIdx;
    if (oppositeDoorIdx === -1) return true;
    return p.door === DOORS[oppositeDoorIdx];
  });
  const isFanYin = isStarFanYin && isDoorFanYin; // 星+门都反吟才算完整反吟

  return {
    name, gender, zodiac: getZodiac(pillars.year.zhiIdx), issue,
    date, solarTerm: "时实盘", yinYang, juNum, pillars, palaces, chartType: type,
    zhiFu: zhiFuStar, zhiShi: zhiShiDoor, horseBranch: EARTHLY_BRANCHES[hBranch], xunShou,
    voidBranches: EARTHLY_BRANCHES[void1] + EARTHLY_BRANCHES[void2],
    isFuYin, isFanYin, isStarFuYin, isDoorFuYin, isStarFanYin, isDoorFanYin,
    bigCycles: big,
    annualCycles: annual
  };
};
