// 小六壬六神完整数据 - 掐指占卜法

export interface LiuShenInfo {
  name: string;
  keywords: string;
  element: string;
  position: string;
  nature: '大吉' | '吉' | '小吉' | '凶' | '大凶';
  color: string;
  guardian: string;
  poem: string;
  meaning: string;
  detail: string;
  singlePalace: {
    general: string;
    wealth: string;
    career: string;
    love: string;
    health: string;
    travel: string;
    lostItem: string;
    lawsuit: string;
    timing: string;
  };
}

export const LIU_SHEN_DATA: LiuShenInfo[] = [
  {
    name: "大安", keywords: "平稳、安定、吉祥", element: "木", position: "东方", nature: "大吉", color: "text-green-600",
    guardian: "青龙",
    poem: "大安事事昌，求财在坤方，失物去不远，宅舍保安康。行人身未动，病者主无妨，将军回田野，仔细更推详。",
    meaning: "身不动时，属木青龙，凡谋事一、五、七日可见分晓",
    detail: "大安为首位，主静而安稳。五行属木，方位东方，临青龙。象征事物平稳发展，所求顺遂。",
    singlePalace: {
      general: "万事大吉，所求皆顺，宜守不宜攻，静中有利。",
      wealth: "求财可得，宜稳中求进。正财运佳，偏财亦有所获。",
      career: "事业顺遂，适合稳步推进。贵人在旁相助，升迁有望。",
      love: "感情和美，婚姻稳固。未婚者姻缘将至，已婚者融洽。",
      health: "身体安康，无大碍。小恙自愈，注意肝胆。",
      travel: "出行平安，行人未动或即将动身。途中无阻。",
      lostItem: "失物尚在不远处，可以找回。寻于东方或家中。",
      lawsuit: "诉讼可和解，有贵人从中调解，结果偏向有利。",
      timing: "应期在一、五、七日或一、五、七月。"
    }
  },
  {
    name: "留连", keywords: "拖延、迟滞、不明", element: "水", position: "北方", nature: "凶", color: "text-blue-600",
    guardian: "玄武",
    poem: "留连事难成，求谋日未明，官事凡宜缓，去者未回程。逢人须借问，随路好商量，更须防口舌，人口且平安。",
    meaning: "卒未归时，属水玄武，凡谋事二、八、十日可见分晓",
    detail: "留连位居第二，主事拖延不决。五行属水，方位北方，临玄武。象征暗昧不明、纠缠不清。",
    singlePalace: {
      general: "事情拖延难成，反复不定。宜耐心等待，不可急躁。",
      wealth: "求财困难，多有拖延。不宜借贷投资，恐有损失。",
      career: "事业进展缓慢，多有阻碍。不宜跳槽，原地等待为佳。",
      love: "感情暧昧不明，拖泥带水。对方犹豫不决。",
      health: "病情缠绵难愈，反复发作。注意肾脏、泌尿系统。",
      travel: "出行不顺，多有延误。行人迟迟未归。",
      lostItem: "失物难寻，可能已被人拿走。物在北方或暗处。",
      lawsuit: "官司拖延日久，难有定论。宜以和为贵。",
      timing: "应期在二、八、十日或二、八、十月。"
    }
  },
  {
    name: "速喜", keywords: "快速、喜庆、大吉", element: "火", position: "南方", nature: "大吉", color: "text-red-600",
    guardian: "朱雀",
    poem: "速喜喜来临，求财向南行，失物申未午，逢人路上寻。官事有福德，病者无祸侵，田宅六畜吉，行人有信音。",
    meaning: "人即至时，属火朱雀，凡谋事三、六、九日可见分晓",
    detail: "速喜位居第三，主喜事来临。五行属火，方位南方，临朱雀。象征喜从天降、好事将近。",
    singlePalace: {
      general: "喜事临门，好消息即将到来。宜积极行动，把握机会。",
      wealth: "财运亨通，求财可得。有意外之财或喜庆收入。",
      career: "事业有喜讯，升职加薪有望。新项目进展顺利。",
      love: "感情有喜，桃花运旺。未婚者即将遇到佳偶。",
      health: "身体好转，病情减轻。就医有效，康复迅速。",
      travel: "出行大吉，行人即将到达。旅途愉快。",
      lostItem: "失物可寻回，在南方或明亮处寻找。",
      lawsuit: "官司有好结果，判决有利。有贵人相助。",
      timing: "应期在三、六、九日或三、六、九月。"
    }
  },
  {
    name: "赤口", keywords: "争执、口舌、是非", element: "金", position: "西方", nature: "凶", color: "text-amber-600",
    guardian: "白虎",
    poem: "赤口主口舌，官非切要防，失物速速讨，行人有惊慌。六畜多作怪，病者出西方，更须防咒嘴，诚恐染瘟殃。",
    meaning: "官事凶时，属金白虎，凡谋事四、七、十日可见分晓",
    detail: "赤口位居第四，主口舌是非。五行属金，方位西方，临白虎。象征争斗、纷争、凶险之事。",
    singlePalace: {
      general: "口舌是非频发，凡事不顺。宜谨言慎行，避免争执。",
      wealth: "求财不利，恐有破财。投资有亏损风险。",
      career: "事业多阻碍，职场是非多。宜低调行事。",
      love: "感情生变，口角不断。宜冷静沟通。",
      health: "身体欠佳，注意呼吸系统和口腔。易有外伤。",
      travel: "出行不利，途中恐有口舌纠纷或意外。",
      lostItem: "失物难找，可能已损坏或被人侵占。在西方寻找。",
      lawsuit: "官司不利，恐有刑罚。宜速和解止损。",
      timing: "应期在四、七、十日或四、七、十月。"
    }
  },
  {
    name: "小吉", keywords: "福气、和合、吉利", element: "水", position: "北方", nature: "吉", color: "text-cyan-600",
    guardian: "六合",
    poem: "小吉最吉昌，路上好商量，阴人来报喜，失物在坤方。行人即便至，交关甚是强，凡事皆和合，病者叩穷苍。",
    meaning: "人来喜时，属水六合，凡谋事一、二、三日可见分晓",
    detail: "小吉位居第五，主和合吉庆。五行属水，方位北方，临六合。象征人和事顺、合作愉快。",
    singlePalace: {
      general: "诸事皆宜，和合吉利。适合合作、洽谈、签约。",
      wealth: "求财顺利，合伙生意有利。有女贵人相助得财。",
      career: "事业和顺，团队合作愉快。商谈成功率高。",
      love: "感情甜蜜，和合美满。适合表白、约会、求婚。",
      health: "身体无大碍，小病快愈。药到病除。",
      travel: "出行顺利，行人即将到达。途中遇贵人。",
      lostItem: "失物可找回，在西南方或家中寻找。有女性知道下落。",
      lawsuit: "官司可和解，调解成功。双方妥协，结果圆满。",
      timing: "应期在一、二、三日或一、二、三月。"
    }
  },
  {
    name: "空亡", keywords: "失败、不成、落空", element: "土", position: "中央", nature: "大凶", color: "text-muted-foreground",
    guardian: "勾陈",
    poem: "空亡事不祥，阴人多乖张，求财无利益，行人有灾殃。失物寻不见，官事有刑伤，病人逢暗鬼，解禳保平安。",
    meaning: "音信稀时，属土勾陈，凡谋事难以预测日期",
    detail: "空亡位居末位，主诸事皆空。五行属土，方位中央，临勾陈。象征一切落空、徒劳无功。",
    singlePalace: {
      general: "万事皆空，所求难成。不宜行动，静守为佳。",
      wealth: "求财无望，投资打水漂。不宜任何财务决策。",
      career: "事业受挫，计划落空。不宜跳槽或创业。",
      love: "感情落空，所托非人。婚姻难成，恋爱无果。",
      health: "身体虚弱，病情不明。暗疾缠身，宜全面检查。注意脾胃。",
      travel: "出行不利，行人有险。在家静守为安。",
      lostItem: "失物已失，无法找回。不必再寻。",
      lawsuit: "官司凶险，难逃刑罚。宜尽早撤诉。",
      timing: "应期难定，事多变化。"
    }
  }
];

export interface DoublePalaceReading {
  combo: string;
  overview: string;
  detail: string;
  advice: string;
}

export const DOUBLE_PALACE_READINGS: Record<string, DoublePalaceReading> = {
  "大安-大安": { combo: "大安 + 大安", overview: "双安叠加，极其稳定", detail: "事物非常稳定，几乎不会有变化。适合守成，不适合开拓新局。", advice: "宜守成，静观其变。" },
  "大安-留连": { combo: "大安 + 留连", overview: "安中有滞，好事多磨", detail: "事情基本面良好，但进展缓慢。最终结果不差，但需要耐心等待。", advice: "不必焦急，耐心等待即可。" },
  "大安-速喜": { combo: "大安 + 速喜", overview: "安稳中有喜讯，锦上添花", detail: "在稳定的基础上迎来好消息，双重吉兆。", advice: "大吉之兆，积极行动，把握喜机。" },
  "大安-赤口": { combo: "大安 + 赤口", overview: "安中有险，谨防口舌", detail: "整体安稳但暗藏口舌是非。可能因言语不慎而引发矛盾。", advice: "宜沉默是金，少说多做。" },
  "大安-小吉": { combo: "大安 + 小吉", overview: "安稳和合，万事如意", detail: "安定与和合的双重加持，人际关系融洽，所求顺遂。", advice: "上吉之兆，宜积极合作，广结善缘。" },
  "大安-空亡": { combo: "大安 + 空亡", overview: "安中带空，有名无实", detail: "表面看起来安稳，实则内里空虚。", advice: "不可被表象迷惑，需深入了解实质。" },

  "留连-大安": { combo: "留连 + 大安", overview: "先滞后安，柳暗花明", detail: "起初拖延不顺，但最终趋于安稳。", advice: "前期耐心忍耐，后期自然好转。" },
  "留连-留连": { combo: "留连 + 留连", overview: "双重拖延，前路漫漫", detail: "事情极度拖延，难以推进。短期内看不到结果。", advice: "暂时搁置此事，另寻他路。" },
  "留连-速喜": { combo: "留连 + 速喜", overview: "久旱逢甘霖，否极泰来", detail: "在漫长的等待后终于迎来好消息。", advice: "坚持等待会有好结果。" },
  "留连-赤口": { combo: "留连 + 赤口", overview: "拖延加口舌，雪上加霜", detail: "事情不仅拖延，还伴随口舌是非。越拖越复杂。", advice: "凶象明显，宜尽早止损。" },
  "留连-小吉": { combo: "留连 + 小吉", overview: "滞而后合，贵人化解", detail: "虽有拖延，但有贵人出面调解，最终圆满解决。", advice: "寻求他人帮助，合作可化解困局。" },
  "留连-空亡": { combo: "留连 + 空亡", overview: "拖延至空，白费心机", detail: "事情拖到最后一场空，所有等待付诸东流。", advice: "大凶之兆，宜立即放弃此事。" },

  "速喜-大安": { combo: "速喜 + 大安", overview: "喜后安定，圆满收官", detail: "先有喜讯，后归安定。好消息带来的利益能持久保持。", advice: "抓住喜机后宜守成。" },
  "速喜-留连": { combo: "速喜 + 留连", overview: "喜中生变，好景不长", detail: "好消息来得快但保持不住，后续可能有变数。", advice: "趁好运在时迅速行动，不可拖延。" },
  "速喜-速喜": { combo: "速喜 + 速喜", overview: "双喜临门，喜上加喜", detail: "连续的好消息，双重喜庆。极好的兆头。", advice: "大吉大利，宜大胆行动。" },
  "速喜-赤口": { combo: "速喜 + 赤口", overview: "乐极生悲，喜中藏祸", detail: "好消息背后暗藏危机。可能因高兴而疏忽大意。", advice: "高兴之余保持警惕。" },
  "速喜-小吉": { combo: "速喜 + 小吉", overview: "喜乐和合，皆大欢喜", detail: "喜事加上和合，人际关系极佳。", advice: "大吉，宜与人共享喜悦。" },
  "速喜-空亡": { combo: "速喜 + 空亡", overview: "空欢喜一场，虚喜而已", detail: "看似有好消息，实则空欢喜。期望落空。", advice: "不可过早高兴，需确认消息真伪。" },

  "赤口-大安": { combo: "赤口 + 大安", overview: "争后平息，化险为夷", detail: "虽有口舌是非，但最终能平息安定。", advice: "忍一时风平浪静。" },
  "赤口-留连": { combo: "赤口 + 留连", overview: "口舌缠身，纠纷不断", detail: "是非口舌持续不断，纠缠不清。短期内难以解决。", advice: "宜远离是非之人。" },
  "赤口-速喜": { combo: "赤口 + 速喜", overview: "先争后喜，因祸得福", detail: "经历口舌争执后反而迎来好结果。塞翁失马。", advice: "不畏争执，坚持立场终有好结果。" },
  "赤口-赤口": { combo: "赤口 + 赤口", overview: "口舌叠加，大凶之兆", detail: "双重口舌是非，极其凶险。诉讼、争斗接连不断。", advice: "大凶，万事不宜。宜闭门谢客。" },
  "赤口-小吉": { combo: "赤口 + 小吉", overview: "争而后和，冰释前嫌", detail: "争执之后促进了理解和和解。", advice: "坦诚沟通可化解一切。" },
  "赤口-空亡": { combo: "赤口 + 空亡", overview: "争而无果，两败俱伤", detail: "争执不断却毫无结果，双方都受伤害。", advice: "大凶，宜立即停止争执。" },

  "小吉-大安": { combo: "小吉 + 大安", overview: "和合安定，天作之合", detail: "和合之后归于安定，最理想的结果。", advice: "上上签，放心大胆行动。" },
  "小吉-留连": { combo: "小吉 + 留连", overview: "合而不决，犹豫不前", detail: "双方有意合作但迟迟不能决定。", advice: "耐心推进合作事宜，不可急于求成。" },
  "小吉-速喜": { combo: "小吉 + 速喜", overview: "和合生喜，双重吉庆", detail: "合作愉快且有喜讯传来。", advice: "大吉，宜扩大合作范围。" },
  "小吉-赤口": { combo: "小吉 + 赤口", overview: "合中有争，暗藏分歧", detail: "表面和睦但内里有分歧。合作中暗藏矛盾。", advice: "宜坦诚沟通，把分歧摆在明面上。" },
  "小吉-小吉": { combo: "小吉 + 小吉", overview: "双合叠加，和气生财", detail: "极度和谐，所有关系都融洽。合作共赢。", advice: "大吉，宜广结善缘。" },
  "小吉-空亡": { combo: "小吉 + 空亡", overview: "合而落空，好心无好报", detail: "努力促成的合作最终落空。付出真心却得不到回报。", advice: "凶兆，宜审视合作对象的诚意。" },

  "空亡-大安": { combo: "空亡 + 大安", overview: "绝处逢生，空而后安", detail: "一切看似落空之后，出现转机归于安定。", advice: "不必绝望，坚持到底终会好转。" },
  "空亡-留连": { combo: "空亡 + 留连", overview: "空上加滞，万念俱灰", detail: "空亡加拖延，事情毫无进展。看不到希望。", advice: "大凶，宜彻底放下此事。另辟蹊径。" },
  "空亡-速喜": { combo: "空亡 + 速喜", overview: "置之死地而后生，逢凶化吉", detail: "在最低谷时突然迎来好消息。峰回路转。", advice: "不放弃就有希望。好运即将到来。" },
  "空亡-赤口": { combo: "空亡 + 赤口", overview: "空而有祸，凶上加凶", detail: "不仅落空，还遭遇口舌是非。屋漏偏逢连夜雨。", advice: "极凶之兆，万事不宜。宜静守不动。" },
  "空亡-小吉": { combo: "空亡 + 小吉", overview: "空而逢合，柳暗花明", detail: "在落空之后遇到贵人相助。事情出现转机。", advice: "求助于人，贵人即在身边。" },
  "空亡-空亡": { combo: "空亡 + 空亡", overview: "双空叠加，大凶至极", detail: "一切彻底落空，毫无希望。所有努力都白费。", advice: "极凶，此事完全不可为。宜重新规划方向。" },
};

export function getNatureVariant(nature: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (nature) {
    case '大吉': case '吉': return 'default';
    case '小吉': return 'secondary';
    case '凶': case '大凶': return 'destructive';
    default: return 'outline';
  }
}

// 十二时辰
export const SHICHEN_NAMES = [
  "子时", "丑时", "寅时", "卯时", "辰时", "巳时",
  "午时", "未时", "申时", "酉时", "戌时", "亥时"
];

export const LUNAR_MONTH_NAMES = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
export const LUNAR_DAY_NAMES = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

/** 将北京时间小时(0-23)转换为时辰序号(0-11) */
export function hourToShichenIndex(hour: number): number {
  // 子时23-1, 丑时1-3, 寅时3-5, ...
  return Math.floor(((hour + 1) % 24) / 2);
}
