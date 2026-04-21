---
name: Iron Army Position Match
description: Sales Chart matches person to 4 sales positions based on Qimen elements being free of 4-harms (空亡/入墓/击刑/门迫); auto-recommends best fit
type: feature
---
"铁军岗位匹配" (Iron Army Position Match) is a Sales Chart sidebar module that evaluates a person's fit for 4 sales roles based on whether key Qimen elements land in palaces free of 4-harms (空亡/入墓/击刑/门迫):

1. **引流王** (广告引流/内容创作): 九天 + 景门 + 丁奇
2. **签单王** (攻坚谈单/现场收网): 白虎 + 伤门 + 庚金
3. **专家王** (方案策划/资产配置): 值符 + 天心星 + 开门
4. **人脉王** (客户关系/转介绍): 六合 + 生门 + 乙奇

Each requirement is checked: found + clean (no 4-harm) = pass. The position with most clean requirements wins (ties broken by declaration order). UI shows per-requirement palace + 4-harm badges, plus a highlighted "最适合岗位" recommendation card. Component: `src/components/IronArmyPositionMatch.tsx`, mounted in `SalesChart.tsx` right after IronArmyIndicator.
