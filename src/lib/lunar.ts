import { getBeijingParts, makeBeijingDate } from "@/lib/time/beijing";

// Mapping for Chinese month names returned by Intl API
const CHINESE_NUMBERS: Record<string, number> = {
  '一': 1, '正': 1, '二': 2, '三': 3, '四': 4, '五': 5, 
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, 
  '十一': 11, '冬': 11, '十二': 12, '腊': 12
};

export const getLunarDate = (date: Date) => {
  try {
    // Use built-in Intl to get Chinese Calendar date (force Beijing timezone)
    const formatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      timeZone: 'Asia/Shanghai',
      day: 'numeric',
      month: 'long',
    });
    
    const parts = formatter.formatToParts(date);
    const monthPart = parts.find(p => p.type === 'month')?.value || '';
    const dayPart = parts.find(p => p.type === 'day')?.value || '';

    // Detect leap month (闰)
    const isLeap = monthPart.includes('闰');
    
    // Simple parsing for Month
    let month = 0;
    const cleanMonth = monthPart.replace('闰', '').replace('月', '');
    if (CHINESE_NUMBERS[cleanMonth]) {
      month = CHINESE_NUMBERS[cleanMonth];
    } else {
      month = parseInt(cleanMonth) || 1;
    }

    // Simple parsing for Day
    let day = parseInt(dayPart.replace(/[^0-9]/g, ''));
    if (isNaN(day)) {
       day = 1; 
    }

    return { month, day, isLeap };
  } catch (e) {
    console.warn("Lunar conversion failed, defaulting to Solar dates", e);

    const p = getBeijingParts(date);
    const bj = makeBeijingDate({ year: p.year, month: p.month, day: p.day, hour: 12, minute: 0 });
    const pp = getBeijingParts(bj);
    return { month: pp.month, day: pp.day, isLeap: false };
  }
};
