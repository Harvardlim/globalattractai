/**
 * 置闰法 (Zhi Run method) for Qimen Dunjia Ju Number calculation.
 *
 * Core algorithm:
 * 1. 上元符头 = 甲子/己卯/甲午/己酉 days (every 15 days in the 60 干支 cycle)
 * 2. Each solar term is assigned to the 上元符头 block containing its astronomical date
 * 3. When the gap between two consecutive terms' 上元符头 ≥ 30 days,
 *    a 闰 (leap) block is inserted, repeating the earlier term's Ju numbers
 * 4. 超神: 符头 runs ahead of the solar term (chaoShen = gz60 % 15)
 * 5. 接气: solar term arrives before its 符头 (after 置闰 correction)
 */

import { Solar } from 'lunar-javascript';

// Simplified-to-traditional mapping for solar term names
const S2T_MAP: Record<string, string> = {
  '谷雨': '穀雨',
  '惊蛰': '驚蟄',
  '处暑': '處暑',
  '芒种': '芒種',
  '小满': '小滿',
};

function s2t(str: string): string {
  let result = str;
  for (const [simplified, traditional] of Object.entries(S2T_MAP)) {
    result = result.replace(new RegExp(simplified, 'g'), traditional);
  }
  return result;
}

interface JieQiConfig {
  yang: boolean;
  ju: number[];
}

export interface ZhiRunResult {
  jieQiName: string;
  nextJieQiName: string;
  yuan: number;
  yuanName: string;
  isYang: boolean;
  yinYang: '陽' | '陰';
  gameNumber: number;
  daysSinceFuTou: number;
  isLeap: boolean;
}

/** Get the noon Julian Day for a Solar date (avoids fractional day issues). */
function noonJD(s: { getYear(): number; getMonth(): number; getDay(): number }): number {
  return Solar.fromYmdHms(s.getYear(), s.getMonth(), s.getDay(), 12, 0, 0).getJulianDay();
}

interface TermEntry {
  tName: string;
  jd: number;
  solar: ReturnType<typeof Solar.fromYmdHms>;
}

/**
 * Build a sorted list of all 24 solar terms (with traditional names)
 * that have a matching config in jieQiJuShu, spanning prev→next year.
 */
function buildTermList(
  year: number,
  jieQiJuShu: Record<string, JieQiConfig>
): TermEntry[] {
  const seenJDs = new Set<number>();
  const list: TermEntry[] = [];

  for (let y = year - 1; y <= year + 1; y++) {
    const tbl = Solar.fromYmd(y, 7, 1).getLunar().getJieQiTable();
    for (const [name, sDate] of Object.entries(tbl)) {
      const jd = noonJD(sDate as any);
      const key = Math.round(jd);
      if (seenJDs.has(key)) continue;
      seenJDs.add(key);

      const tName = s2t(name);
      if (jieQiJuShu[tName]) {
        list.push({ tName, jd, solar: sDate as any });
      }
    }
  }

  list.sort((a, b) => a.jd - b.jd);
  return list;
}

/**
 * Calculate the 60 干支 index from heavenly stem and earthly branch indices.
 * Uses CRT: gz60 = (36 * ganIdx + 25 * zhiIdx) % 60
 */
function getGanZhi60(ganIdx: number, zhiIdx: number): number {
  return (36 * ganIdx + 25 * zhiIdx) % 60;
}

/**
 * Get the 上元符头 distance: how many days since the last 上元符头
 * (甲子=0, 己卯=15, 甲午=30, 己酉=45 in the 60 cycle).
 * Returns 0-14.
 */
function getFuTouDistance(ganIdx: number, zhiIdx: number): number {
  const gz60 = getGanZhi60(ganIdx, zhiIdx);
  return gz60 % 15;
}

interface Block {
  tName: string;
  fuTouJD: number;
  isLeap: boolean;
  config: JieQiConfig;
}

export function calculateJuByZhiRun(
  solar: ReturnType<typeof Solar.fromYmdHms>,
  jieQiJuShu: Record<string, JieQiConfig>,
  yuanNames: readonly string[]
): ZhiRunResult {
  const year = solar.getYear();
  const termList = buildTermList(year, jieQiJuShu);
  const currentJD = noonJD(solar);

  // For each term, compute its 上元符头 JD
  const termsWithFuTou = termList.map(term => {
    const lunar = (term.solar as any).getLunar();
    const ganIdx = lunar.getDayGanIndex();   // 0-9
    const zhiIdx = lunar.getDayZhiIndex();   // 0-11
    const dist = getFuTouDistance(ganIdx, zhiIdx); // 0-14
    return { ...term, fuTouJD: term.jd - dist, chaoShen: dist };
  });

  // Build timeline of blocks.
  // Each term gets one 15-day block starting at its 上元符头.
  // When gap between consecutive terms' 上元符头 ≥ 30, insert a 闰 block.
  const blocks: Block[] = [];

  for (let i = 0; i < termsWithFuTou.length; i++) {
    const t = termsWithFuTou[i];
    const config = jieQiJuShu[t.tName];
    if (!config) continue;

    blocks.push({ tName: t.tName, fuTouJD: t.fuTouJD, isLeap: false, config });

    if (i + 1 < termsWithFuTou.length) {
      const nextT = termsWithFuTou[i + 1];
      const gap = Math.round(nextT.fuTouJD - t.fuTouJD);
      if (gap >= 30) {
        // 置闰: insert a leap block repeating this term
        blocks.push({ tName: t.tName, fuTouJD: t.fuTouJD + 15, isLeap: true, config });
      }
    }
  }

  // Find the active block: last block whose fuTouJD ≤ currentJD
  let activeBlock: Block | null = null;
  let activeIdx = -1;
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i].fuTouJD <= currentJD) {
      activeBlock = blocks[i];
      activeIdx = i;
      break;
    }
  }

  if (!activeBlock) {
    throw new Error('Cannot determine current solar term');
  }

  const daysSinceFuTou = Math.round(currentJD - activeBlock.fuTouJD);
  const yuan = Math.min(Math.floor(daysSinceFuTou / 5), 2);

  // Find the next different term name for display
  let nextJieQiName = '';
  for (let i = activeIdx + 1; i < blocks.length; i++) {
    if (blocks[i].tName !== activeBlock.tName) {
      nextJieQiName = blocks[i].tName;
      break;
    }
  }

  return {
    jieQiName: activeBlock.tName,
    nextJieQiName,
    yuan,
    yuanName: yuanNames[yuan],
    isYang: activeBlock.config.yang,
    yinYang: activeBlock.config.yang ? '陽' : '陰',
    gameNumber: activeBlock.config.ju[yuan],
    daysSinceFuTou,
    isLeap: activeBlock.isLeap,
  };
}
