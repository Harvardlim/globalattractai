import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BranchRelationDiagrams from "@/components/BranchRelationDiagrams";

const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIAC_NAMES = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

// 地支关系数据表
const BRANCH_RELATIONS = [
  { branch: "子", zodiac: "鼠", liuHe: "丑", sanHe: "辰申", sanHui: "丑亥", chong: "午", xing: "卯", po: "酉", hai: "未", jue: "巳" },
  { branch: "丑", zodiac: "牛", liuHe: "子", sanHe: "巳酉", sanHui: "子亥", chong: "未", xing: "戌", po: "辰", hai: "午", jue: "" },
  { branch: "寅", zodiac: "虎", liuHe: "亥", sanHe: "午戌", sanHui: "卯辰", chong: "申", xing: "巳", po: "亥", hai: "巳", jue: "酉" },
  { branch: "卯", zodiac: "兔", liuHe: "戌", sanHe: "未亥", sanHui: "寅辰", chong: "酉", xing: "子", po: "午", hai: "辰", jue: "申" },
  { branch: "辰", zodiac: "龙", liuHe: "酉", sanHe: "子申", sanHui: "寅卯", chong: "戌", xing: "辰", po: "丑", hai: "卯", jue: "" },
  { branch: "巳", zodiac: "蛇", liuHe: "申", sanHe: "丑酉", sanHui: "午未", chong: "亥", xing: "申", po: "申", hai: "寅", jue: "子" },
  { branch: "午", zodiac: "马", liuHe: "未", sanHe: "寅戌", sanHui: "巳未", chong: "子", xing: "午", po: "卯", hai: "丑", jue: "亥" },
  { branch: "未", zodiac: "羊", liuHe: "午", sanHe: "卯亥", sanHui: "巳午", chong: "丑", xing: "丑", po: "戌", hai: "子", jue: "" },
  { branch: "申", zodiac: "猴", liuHe: "巳", sanHe: "子辰", sanHui: "酉戌", chong: "寅", xing: "寅", po: "巳", hai: "亥", jue: "卯" },
  { branch: "酉", zodiac: "鸡", liuHe: "辰", sanHe: "丑巳", sanHui: "申戌", chong: "卯", xing: "酉", po: "子", hai: "戌", jue: "寅" },
  { branch: "戌", zodiac: "狗", liuHe: "卯", sanHe: "寅午", sanHui: "申酉", chong: "辰", xing: "未", po: "未", hai: "酉", jue: "" },
  { branch: "亥", zodiac: "猪", liuHe: "寅", sanHe: "卯未", sanHui: "子丑", chong: "巳", xing: "亥", po: "寅", hai: "申", jue: "午" },
];

// 天干五合
const STEM_COMBINATIONS = [
  { stem: "甲", partner: "己", result: "合化土", desc: "甲为阳木，己为阴土。木克土而相合，如君臣相遇、刚柔相济。合化土后主信义厚重，利于稳定发展。" },
  { stem: "乙", partner: "庚", result: "合化金", desc: "乙为阴木，庚为阳金。金克木而相合，如夫妻相配、仁义兼备。合化金后主果断坚毅，利于开拓进取。" },
  { stem: "丙", partner: "辛", result: "合化水", desc: "丙为阳火，辛为阴金。火克金而相合，如威制与服从。合化水后主智慧灵动，利于变通谋略。" },
  { stem: "丁", partner: "壬", result: "合化木", desc: "丁为阴火，壬为阳水。水克火而相合，如淫慝之合、情深意重。合化木后主仁慈生长，利于学习发展。" },
  { stem: "戊", partner: "癸", result: "合化火", desc: "戊为阳土，癸为阴水。土克水而相合，如无情之合、老少相配。合化火后主礼仪文明，利于名声传扬。" },
];

// 天干五克
const STEM_CLASHES = [
  { stem: "甲乙（木）", target: "戊己（土）", desc: "木克土" },
  { stem: "丙丁（火）", target: "庚辛（金）", desc: "火克金" },
  { stem: "戊己（土）", target: "壬癸（水）", desc: "土克水" },
  { stem: "庚辛（金）", target: "甲乙（木）", desc: "金克木" },
  { stem: "壬癸（水）", target: "丙丁（火）", desc: "水克火" },
];

// 支藏天干（本气、中气、余气）
const BRANCH_HIDDEN_STEMS: { branch: string; benQi: string; zhongQi: string; yuQi: string }[] = [
  { branch: "子", benQi: "癸", zhongQi: "", yuQi: "" },
  { branch: "丑", benQi: "己", zhongQi: "辛", yuQi: "癸" },
  { branch: "寅", benQi: "甲", zhongQi: "丙", yuQi: "戊" },
  { branch: "卯", benQi: "乙", zhongQi: "", yuQi: "" },
  { branch: "辰", benQi: "戊", zhongQi: "乙", yuQi: "癸" },
  { branch: "巳", benQi: "丙", zhongQi: "戊", yuQi: "庚" },
  { branch: "午", benQi: "丁", zhongQi: "己", yuQi: "" },
  { branch: "未", benQi: "己", zhongQi: "丁", yuQi: "乙" },
  { branch: "申", benQi: "庚", zhongQi: "壬", yuQi: "戊" },
  { branch: "酉", benQi: "辛", zhongQi: "", yuQi: "" },
  { branch: "戌", benQi: "戊", zhongQi: "辛", yuQi: "丁" },
  { branch: "亥", benQi: "壬", zhongQi: "甲", yuQi: "" },
];

// 天干五行颜色
const STEM_ELEMENT_COLOR: Record<string, string> = {
  '甲': 'text-green-600 dark:text-green-400',
  '乙': 'text-green-600 dark:text-green-400',
  '丙': 'text-red-600 dark:text-red-400',
  '丁': 'text-red-600 dark:text-red-400',
  '戊': 'text-yellow-700 dark:text-yellow-400',
  '己': 'text-yellow-700 dark:text-yellow-400',
  '庚': 'text-amber-600 dark:text-amber-300',
  '辛': 'text-amber-600 dark:text-amber-300',
  '壬': 'text-blue-600 dark:text-blue-400',
  '癸': 'text-blue-600 dark:text-blue-400',
};

const HEADERS = [
  { key: "branch", label: "" },
  { key: "liuHe", label: "六合" },
  { key: "sanHe", label: "三合" },
  { key: "sanHui", label: "三会" },
  { key: "chong", label: "冲" },
  { key: "xing", label: "刑" },
  { key: "po", label: "破" },
  { key: "hai", label: "害" },
  { key: "jue", label: "绝" },
];

const LIFE_STAGES = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 十天干对应十二长生位 (starting branch index for 长生, direction: 1=forward, -1=backward)
const STEM_CHANGSHENG: { start: number; dir: number }[] = [
  { start: 11, dir: 1 },  // 甲 -> 亥
  { start: 6, dir: -1 },  // 乙 -> 午
  { start: 2, dir: 1 },   // 丙 -> 寅
  { start: 9, dir: -1 },  // 丁 -> 酉
  { start: 2, dir: 1 },   // 戊 -> 寅
  { start: 9, dir: -1 },  // 己 -> 酉
  { start: 5, dir: 1 },   // 庚 -> 巳
  { start: 0, dir: -1 },  // 辛 -> 子
  { start: 8, dir: 1 },   // 壬 -> 申
  { start: 3, dir: -1 },  // 癸 -> 卯
];

function getChangShengRow(stemIdx: number): string[] {
  const { start, dir } = STEM_CHANGSHENG[stemIdx];
  return LIFE_STAGES.map((_, i) => {
    const branchIdx = ((start + dir * i) % 12 + 12) % 12;
    return BRANCHES[branchIdx];
  });
}

const BranchRelations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">地支关系</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-100 dark:bg-amber-900/30">
                {HEADERS.map((header) => (
                  <th
                    key={header.key}
                    className={cn(
                      "px-2 py-2.5 text-center font-medium border-r border-amber-200 dark:border-amber-800 last:border-r-0",
                      header.key === "branch" ? "min-w-[60px]" : "min-w-[50px]"
                    )}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BRANCH_RELATIONS.map((row, idx) => (
                <tr
                  key={row.branch}
                  className={cn(
                    "border-t border-amber-200 dark:border-amber-800",
                    idx % 2 === 0 
                      ? "bg-amber-50/50 dark:bg-amber-950/20" 
                      : "bg-amber-100/50 dark:bg-amber-900/20"
                  )}
                >
                  <td className="px-2 py-2 text-center font-medium border-r border-amber-200 dark:border-amber-800">
                    <span className="text-amber-800 dark:text-amber-300">
                      {row.branch}（{row.zodiac}）
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                    {row.liuHe}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                    {row.sanHe}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                    {row.sanHui}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800 text-red-600 dark:text-red-400">
                    {row.chong}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800 text-orange-600 dark:text-orange-400">
                    {row.xing}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                    {row.po}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-amber-200 dark:border-amber-800">
                    {row.hai}
                  </td>
                  <td className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">
                    {row.jue || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 地支关系图解 */}
        <BranchRelationDiagrams />

        {/* 支藏天干 */}
        <h2 className="text-base font-semibold mt-6 mb-2">支藏天干</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-violet-100 dark:bg-violet-900/30">
                <th colSpan={2} className="px-2 py-2.5 text-center font-medium border-r border-violet-200 dark:border-violet-800 min-w-[60px]">地支</th>
                {EARTHLY_BRANCHES.map((b) => (
                  <th key={b} className="px-2 py-2.5 text-center font-medium border-r border-violet-200 dark:border-violet-800 last:border-r-0 min-w-[32px]">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['benQi', 'zhongQi', 'yuQi'] as const).map((qiKey, rowIdx) => {
                const label = qiKey === 'benQi' ? '本气' : qiKey === 'zhongQi' ? '中气' : '余气';
                return (
                  <tr
                    key={qiKey}
                    className={cn(
                      "border-t border-violet-200 dark:border-violet-800",
                      rowIdx % 2 === 0
                        ? "bg-violet-50/50 dark:bg-violet-950/20"
                        : "bg-violet-100/50 dark:bg-violet-900/20"
                    )}
                  >
                    {rowIdx === 0 && (
                      <td rowSpan={3} className="px-2 py-2 text-center font-medium border-r border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300 align-middle">
                        藏气
                      </td>
                    )}
                    <td className="px-2 py-2 text-center font-medium border-r border-violet-200 dark:border-violet-800 text-muted-foreground text-xs">
                      {label}
                    </td>
                    {BRANCH_HIDDEN_STEMS.map((item) => {
                      const stem = item[qiKey];
                      return (
                        <td key={item.branch} className={cn(
                          "px-2 py-2 text-center border-r border-violet-200 dark:border-violet-800 last:border-r-0 font-medium",
                          stem ? STEM_ELEMENT_COLOR[stem] : ''
                        )}>
                          {stem || ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold mt-6 mb-2">天干五合</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-100 dark:bg-emerald-900/30">
                <th className="px-3 py-2.5 text-center font-medium border-r border-emerald-200 dark:border-emerald-800 w-16">天干</th>
                <th className="px-3 py-2.5 text-center font-medium border-r border-emerald-200 dark:border-emerald-800 w-16">合化</th>
                <th className="px-3 py-2.5 text-center font-medium border-r border-emerald-200 dark:border-emerald-800 w-20">结果</th>
                <th className="px-3 py-2.5 text-left font-medium">解说</th>
              </tr>
            </thead>
            <tbody>
              {STEM_COMBINATIONS.map((row, idx) => (
                <tr
                  key={row.stem}
                  className={cn(
                    "border-t border-emerald-200 dark:border-emerald-800",
                    idx % 2 === 0
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "bg-emerald-100/50 dark:bg-emerald-900/20"
                  )}
                >
                  <td className="px-3 py-2 text-center font-medium border-r border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                    {row.stem}
                  </td>
                  <td className="px-3 py-2 text-center border-r border-emerald-200 dark:border-emerald-800">
                    {row.partner}
                  </td>
                  <td className="px-3 py-2 text-center text-emerald-700 dark:text-emerald-400 font-medium border-r border-emerald-200 dark:border-emerald-800">
                    {row.result}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 天干五克 Table */}
        <h2 className="text-base font-semibold mt-6 mb-2">天干五克</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-100 dark:bg-red-900/30">
                <th className="px-4 py-2.5 text-center font-medium border-r border-red-200 dark:border-red-800">主克天干</th>
                <th className="px-4 py-2.5 text-center font-medium border-r border-red-200 dark:border-red-800">被克天干</th>
                <th className="px-4 py-2.5 text-center font-medium">克制关系</th>
              </tr>
            </thead>
            <tbody>
              {STEM_CLASHES.map((row, idx) => (
                <tr
                  key={row.desc}
                  className={cn(
                    "border-t border-red-200 dark:border-red-800",
                    idx % 2 === 0
                      ? "bg-red-50/50 dark:bg-red-950/20"
                      : "bg-red-100/50 dark:bg-red-900/20"
                  )}
                >
                  <td className="px-4 py-2 text-center font-medium border-r border-red-200 dark:border-red-800">
                    {row.stem}
                  </td>
                  <td className="px-4 py-2 text-center border-r border-red-200 dark:border-red-800">
                    {row.target}
                  </td>
                  <td className="px-4 py-2 text-center text-red-600 dark:text-red-400 font-medium">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">关系说明</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><span className="font-medium text-emerald-600 dark:text-emerald-400">天干五合</span>：天干相合，主合化亲和</div>
            <div><span className="font-medium text-red-600 dark:text-red-400">天干五克</span>：天干相克，主克制消耗</div>
            <div><span className="font-medium">六合</span>：两支相合，主和谐亲密</div>
            <div><span className="font-medium">三合</span>：三支合局，力量加强</div>
            <div><span className="font-medium">三会</span>：三支会局，势力聚集</div>
            <div><span className="font-medium text-red-600 dark:text-red-400">冲</span>：两支相冲，主冲突变动</div>
            <div><span className="font-medium text-orange-600 dark:text-orange-400">刑</span>：两支相刑，主刑伤是非</div>
            <div><span className="font-medium">破</span>：两支相破，主破坏损耗</div>
            <div><span className="font-medium">害</span>：两支相害，主暗害阻碍</div>
            <div><span className="font-medium">绝</span>：五行绝地，力量最弱</div>
          </div>
        </div>

        {/* 十天干对应十二长生位 */}
        <h2 className="text-base font-semibold mt-6 mb-2">十天干对应十二长生位</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal-100 dark:bg-teal-900/30">
                <th className="px-2 py-2.5 text-center font-medium border-r border-teal-200 dark:border-teal-800 min-w-[50px]">天干</th>
                {LIFE_STAGES.map((stage) => (
                  <th key={stage} className="px-2 py-2.5 text-center font-medium border-r border-teal-200 dark:border-teal-800 last:border-r-0 min-w-[40px]">
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STEMS.map((stem, idx) => {
                const row = getChangShengRow(idx);
                return (
                  <tr
                    key={stem}
                    className={cn(
                      "border-t border-teal-200 dark:border-teal-800",
                      idx % 2 === 0
                        ? "bg-teal-50/50 dark:bg-teal-950/20"
                        : "bg-teal-100/50 dark:bg-teal-900/20"
                    )}
                  >
                    <td className="px-2 py-2 text-center font-medium border-r border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300">
                      {stem}
                    </td>
                    {row.map((branch, i) => (
                      <td key={i} className={cn(
                        "px-2 py-2 text-center border-r border-teal-200 dark:border-teal-800 last:border-r-0",
                        (LIFE_STAGES[i] === "帝旺" || LIFE_STAGES[i] === "临官" || LIFE_STAGES[i] === "长生") && "font-medium text-teal-700 dark:text-teal-300",
                        (LIFE_STAGES[i] === "死" || LIFE_STAGES[i] === "墓" || LIFE_STAGES[i] === "绝") && "text-muted-foreground"
                      )}>
                        {branch}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BranchRelations;
