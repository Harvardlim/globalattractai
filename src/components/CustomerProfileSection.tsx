import React, { useMemo } from "react";
import { Star } from "lucide-react";
import { ChartData } from "@/types";
import { BRANCH_PALACE_MAP, PALACE_INFO, BAGUA } from "@/lib/constants";
import { getYearGanZhi } from "@/lib/ganzhiHelper";
import { getLunarDate } from "@/lib/lunar";

// 八神 → 顾客画像描述
const GOD_PROFILES: Record<string, { label: string; description: string; emoji: string }> = {
  '九天': {
    label: '九天',
    description: '卖梦想给顾客',
    emoji: '🌤️',
  },
  '九地': {
    label: '九地',
    description: '落地，长远规划',
    emoji: '🌍',
  },
  '白虎': {
    label: '白虎',
    description: '说话要有力量，杀伐果断，果断决策，做紧张气氛',
    emoji: '🐯',
  },
  '玄武': {
    label: '玄武',
    description: '卖小间的屋子，有小孩子的父母，黑皮肤（比如马来人，印度人）',
    emoji: '🐢',
  },
  '六合': {
    label: '六合',
    description: '卖有家庭的人',
    emoji: '👨‍👩‍👧‍👦',
  },
  '值符': {
    label: '值符',
    description: '卖贵的屋子，讲价值，讲发展商背景',
    emoji: '👑',
  },
  '太阴': {
    label: '太阴',
    description: '规划未来，规划生活空间，也主女性顾客（比如单身女性，太太）',
    emoji: '🌙',
  },
  '螣蛇': {
    label: '腾蛇',
    description: '擅长利用技巧、寻找漏洞或切入点来成交，引起顾客好奇心，顾客画像比如大女主风格，喜欢漂亮和美感',
    emoji: '🐍',
  },
};

// 九星 → 销售顾客画像
const STAR_PROFILES: Record<string, { title: string; portrait: string; play: string; plain: string }> = {
  '天心': {
    title: '天心星 · 大老板 / 专业人士',
    portrait: '穿西装、驾大车、谈吐斯文但眼神犀利。他们不听废话，只要看数据、看 ROI、看扣税。',
    play: '表现得比他更专业。你要像个"全能医生"，不仅卖房，还能谈法律和银行配套。',
    plain: '这种人要的是掌控感，你够专业，他才下单。',
  },
  '天蓬': {
    title: '天蓬星 · 投机客 / 赌徒心态',
    portrait: '喜欢听"底价"、喜欢"翻倍"、敢拿杠杆（Leverage）的人。他们不怕风险，只怕没赚头。',
    play: '拿出你的"胆略"。直接抛出大项目、大折扣，告诉他哪里有"漏"可以捡。',
    plain: '这种人要的是暴利，你要表现得像个"收风"的，带他赚大钱。',
  },
  '天任': {
    title: '天任星 · 一家大细 / 退休族',
    portrait: '穿 T 恤拖鞋来看房，问得最细：附近有没有巴刹？学校远不远？地基稳不稳？',
    play: '拿出你的"老实"。别催他，陪他慢慢看，讲房子的实用性和耐用性。',
    plain: '这种人要的是安全感，你够稳重、够耐心，他就跟你买。',
  },
  '天冲': {
    title: '天冲星 · 年轻人 / 赶时间族',
    portrait: '第一次买房（First Home Buyer），动作快，WhatsApp 回得快，急着想搬出来住。',
    play: '拿出你的"速度"。今天看房，明天就要帮他搞定 Loan。别跟他讲长篇大论，直接给结论。',
    plain: '这种人要的是爽快，你办事够快，他就没时间去看别的项目。',
  },
  '天辅': {
    title: '天辅星 · 高雅人士 / 老师 / 医生',
    portrait: '注重生活品质、注重学区、注重邻居素质的人。他们看中精神层面的东西。',
    play: '展现你的"文化底蕴"。多讲讲社区的文化氛围、装修的设计美感。',
    plain: '这种人要的是面子和格调，你得像个艺术家一样带他看生活方式。',
  },
  '天英': {
    title: '天英星 · 爱 Show 族 / 网红趋势族',
    portrait: '哪里红就去哪里，买房要买地标（Landmark），一定要能拍照发 Instagram。',
    play: '发挥你的"名气"。带他看最炫的设施、最美的 View。',
    plain: '这种人要的是炫耀感，你把这房子夸得全马最红，他就掏钱了。',
  },
  '天芮': {
    title: '天芮星 · 挑剔怪 / 细节控',
    portrait: '进屋先看墙角有没有裂缝，厕所漏不漏水。他总是能找到房子的"毛病"。',
    play: '拿出你的"诊断力"。承认小缺点，但用更牛的优点去"对症下药"解决他的顾虑。',
    plain: '这种人要的是心理平衡，你帮他解决掉顾虑，他就觉得这单成交得值。',
  },
  '天柱': {
    title: '天柱星 · 辩论王 / 压价高手',
    portrait: '进门就开始踩：这地段不好、这价格太贵。其实他想买，但他想压你价。',
    play: '拿出你的"铁嘴功"。他踩地段，你讲未来规划；他压价格，你讲稀缺价值。',
    plain: '这种人要的是赢的感觉，你在谈判桌上守住底线又给他甜头，他就签单。',
  },
};

// 农历月 → 宫位
const LUNAR_MONTH_PALACE: Record<number, number> = {
  11: 1,  // 坎
  12: 8,  // 艮
  1: 8,   // 艮
  2: 3,   // 震
  3: 4,   // 巽
  4: 4,   // 巽
  5: 9,   // 离
  6: 2,   // 坤
  7: 2,   // 坤
  8: 7,   // 兑
  9: 6,   // 乾
  10: 6,  // 乾
};

// 农历月显示排序（从正月开始）
const MONTH_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const LUNAR_MONTH_NAMES: Record<number, string> = {
  1: '正月', 2: '二月', 3: '三月', 4: '四月',
  5: '五月', 6: '六月', 7: '七月', 8: '八月',
  9: '九月', 10: '十月', 11: '冬月', 12: '腊月',
};

// 2026年农历月对应的具体公历日期
const LUNAR_MONTH_DATES_2026: Record<number, string> = {
  1: '2/17 - 3/18', 2: '3/19 - 4/16', 3: '4/17 - 5/16', 4: '5/17 - 6/14',
  5: '6/15 - 7/13', 6: '7/14 - 8/12', 7: '8/13 - 9/10', 8: '9/11 - 10/9',
  9: '10/10 - 11/8', 10: '11/9 - 12/8', 11: '12/9 - 1/7', 12: '1/8 - 2/5',
};

interface CustomerProfileSectionProps {
  chart: ChartData;
}

const GodProfileCard: React.FC<{ god: string; palaceName: string; highlight?: boolean }> = ({ god, palaceName, highlight }) => {
  const profile = GOD_PROFILES[god];
  if (!profile) return (
    <div className="bg-muted/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
      {palaceName}宫 · {god || '无'}
    </div>
  );

  return (
    <div className={`rounded-lg p-3 space-y-1 ${highlight ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'}`}>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{profile.label}</span>
        <span className="text-xs text-muted-foreground ml-auto">{palaceName}宫</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{profile.description}</p>
    </div>
  );
};

const CustomerProfileSection: React.FC<CustomerProfileSectionProps> = ({ chart }) => {
  // 今年的宫位：根据流年地支 → 宫位
  const yearlyData = useMemo(() => {
    const now = new Date();
    const yearGZ = getYearGanZhi(now);
    const palaceId = BRANCH_PALACE_MAP[yearGZ.zhiIdx];
    const palace = chart.palaces.find(p => p.id === palaceId);
    const god = palace?.god || '';
    const palaceName = BAGUA[palaceId] || '';
    return { palaceId, palaceName, god, year: now.getFullYear(), gan: yearGZ.gan, zhi: yearGZ.zhi };
  }, [chart]);

  // 当前农历月
  const currentLunarMonth = useMemo(() => {
    const now = new Date();
    try {
      const lunar = getLunarDate(now);
      return lunar.month;
    } catch {
      return null;
    }
  }, []);

  // 按宫位分组的每月顾客画像
  const groupedData = useMemo(() => {
    // 按显示顺序排列宫位：艮(12,1) → 震(2) → 巽(3,4) → 离(5) → 坤(6,7) → 兑(8) → 乾(9,10) → 坎(11)
    const palaceOrder = [8, 3, 4, 9, 2, 7, 6, 1];
    const groups: { palaceId: number; palaceName: string; god: string; star: string; months: number[]; hasCurrent: boolean }[] = [];

    for (const pid of palaceOrder) {
      const months = MONTH_DISPLAY_ORDER.filter(m => LUNAR_MONTH_PALACE[m] === pid);
      if (months.length === 0) continue;
      const palace = chart.palaces.find(p => p.id === pid);
      const god = palace?.god || '';
      const star = palace?.star || '';
      const palaceName = BAGUA[pid] || '';
      const hasCurrent = months.some(m => m === currentLunarMonth);
      groups.push({ palaceId: pid, palaceName, god, star, months, hasCurrent });
    }
    return groups;
  }, [chart, currentLunarMonth]);

  return (
    <div className="space-y-4">
      {/* 今年顾客画像 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">
            {yearlyData.year}年（{yearlyData.gan}{yearlyData.zhi}）主要顾客画像
          </h4>
        </div>
        <GodProfileCard god={yearlyData.god} palaceName={yearlyData.palaceName} highlight />
      </div>

      {/* 每月顾客画像 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">每月顾客画像</h4>
        </div>
        <div className="space-y-2">
          {groupedData.map(group => (
            <div key={group.palaceId} className="relative">
              {group.hasCurrent && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
              )}
              <div className={`rounded-lg p-3 space-y-1.5 ${group.hasCurrent ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  {group.months.map(m => (
                    <span key={m} className="text-xs font-semibold">
                      {LUNAR_MONTH_NAMES[m]}
                      <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                        ({LUNAR_MONTH_DATES_2026[m]})
                      </span>
                      {m === currentLunarMonth && (
                        <span className="text-[10px] px-1 py-0.5 rounded-full bg-primary text-primary-foreground font-medium ml-1">
                          本月
                        </span>
                      )}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto">{group.palaceName}宫</span>
                </div>
                {GOD_PROFILES[group.god] ? (
                  <div>
                    <span className="text-xs font-semibold">{GOD_PROFILES[group.god].label}</span>
                    <span className="text-[11px] text-muted-foreground ml-1.5">
                      {GOD_PROFILES[group.god].description}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{group.god || '无'}</span>
                )}
                {STAR_PROFILES[group.star] && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-1 text-[11px] leading-relaxed">
                    <div className="text-xs font-semibold text-primary">{STAR_PROFILES[group.star].title}</div>
                    <div>
                      <span className="font-semibold">顾客画像：</span>
                      <span className="text-muted-foreground">{STAR_PROFILES[group.star].portrait}</span>
                    </div>
                    <div>
                      <span className="font-semibold">怎么发挥：</span>
                      <span className="text-muted-foreground">{STAR_PROFILES[group.star].play}</span>
                    </div>
                    <div>
                      <span className="font-semibold">大白话：</span>
                      <span className="text-muted-foreground">{STAR_PROFILES[group.star].plain}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileSection;
