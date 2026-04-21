/**
 * 十干克应 (Ten Heavenly Stems Clash Applications)
 * 天盘干与地盘干的组合象意
 * 依据《御定奇门宝鉴》
 */

export interface KeYingInfo {
  name: string;           // 克应名称
  description: string;    // 解释说明
  nature: 'auspicious' | 'inauspicious' | 'neutral'; // 吉凶
}

// 天干索引映射
const STEM_INDEX: Record<string, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

// 十干克应表 [天盘干][地盘干] - 依据《御定奇门宝鉴》
const KE_YING_DATA: KeYingInfo[][] = [
  // 天盘甲 (甲为遁甲，实际以值符所落宫位论，此处列出仪干加甲的情况)
  [
    // 甲 + 甲
    // { name: '伏吟', description: '凡事闭塞，静守为吉，不宜动作', nature: 'neutral' },
    { name: '青龙入地', description: '甲甲比肩，名谓伏吟。回环辗转，进退未决，占信，则喜信必来。门合则美，门塞星凶，空有财至。适合养精蓄锐，等待机遇，其意义相当于潜龙勿用。遇此，凡事不利，道路闭塞，以守为好。', nature: 'neutral' },

    // 甲 + 乙
    // { name: '青龙合会', description: '贵人助，合主病多，吉凶看门', nature: 'auspicious' },
    { name: '青龙合会', description: '甲己会合，因甲乙均位于东方青龙之位，所以又叫青龙和会，会得到同事，朋友的帮助，凡事主客均利，有利于谒贵，面试，门吉事也吉，门凶事也区。', nature: 'auspicious' },

    // 甲 + 丙
    // { name: '青龙返首', description: '大吉大利，若逢击刑则吉事成凶', nature: 'auspicious' },
    { name: '青龙返首', description: '因青龙甲木生助丙火，故为青龙返首，如宫门无克，则大吉大利。如宫门相克，则诸事费力才成。又主土木动作，宅室光辉，父子大利。门克宫则利客，宫克门则利主，但本局虽吉利，却忌讳遇到六仪击刑，门迫以及奇仪入墓。若逢迫墓击刑，吉事成凶。', nature: 'auspicious' },

    // 甲 + 丁
    // { name: '青龙耀明', description: '谒贵求名吉，击刑则减吉', nature: 'auspicious' },
    { name: '青龙耀明', description: '因甲木青龙生助丁火，故为青龙耀明，宜见上级领导、贵人、求功名，为事吉利。主得暗助，又主凡事迅速，此格对工作，官职，学业，文化，事业等大利。对占断官司则不利，尤其门凶时则更凶。若值墓迫，招惹是非。', nature: 'auspicious' },    

    // 甲 + 戊
    // { name: '青龙伏吟', description: '凡事闭塞，静守为吉，不宜动作', nature: 'neutral' },
    { name: '青龙入地', description: '甲甲比肩，名谓伏吟。回环辗转，进退未决，占信，则喜信必来。门合则美，门塞星凶，空有财至。适合养精蓄锐，等待机遇，其意义相当于潜龙勿用。遇此，凡事不利，道路闭塞，以守为好。', nature: 'neutral' },

    // 甲 + 己
    // { name: '贵人入狱', description: '公私不利，凡事受阻，需冲开方好', nature: 'inauspicious' },
    { name: '青龙相合', description: '主有财运，婚姻之喜，若门生宫及比合，则主百事吉，门克宫则好事成蹉跎，有始无终。此格不利求贵与面试，因为戌为戊土之墓，故为贵人入狱，公私皆不利。宜踏实稳步，齐心协力。', nature: 'inauspicious' },

    // 甲 + 庚
    // { name: '值符飞宫', description: '换地易迁，吉事不吉，凶事更凶', nature: 'inauspicious' },
    { name: '青龙失势', description: '甲最怕庚金克杀，故为值符飞宫，吉事不吉，区事更凶，求财没利益，测病也主凶，防不测之灾，如入虎穴，如单身探敌宫。又为太白登天门格，如门制宫则凶，如见天辅星，则大利考试。同时，甲庚相冲，飞宫也主换地方。', nature: 'inauspicious' },

    // 甲 + 辛
    // { name: '青龙折足', description: '吉门尚可，凶门失财，防足疾', nature: 'inauspicious' },
    { name: '青龙折足', description: '因辛金克甲木，子午相冲，故为青龙折足，吉门有生肋，尚能谋事，若逢凶门，主招灾、失财或有足疾、折伤。', nature: 'inauspicious' },
    
    // 甲 + 壬
    // { name: '青龙天牢', description: '诸事不利，投资亏本，测病主凶', nature: 'inauspicious' },
    { name: '蛇入地罗', description: '外人缠绕，内事索索，吉门吉星，庶免蹉跎。凡事破败难定。', nature: 'inauspicious' },

    // 甲 + 癸
    // { name: '青龙华盖', description: '为利而合，吉凶看门，事有纠缠', nature: 'neutral' },
    { name: '青龙华盖', description: '首尾无应，事有分歧，因甲为青龙，癸为天网，又为华盖，故为青龙华盖，又戊癸相合，故逢吉门为吉，可招福临门。门宫生比则诸事大吉，若门克宫则成中有败。本格适合占测婚姻感情与合作交易。逢凶门者事多不利，为凶。', nature: 'neutral' },
  ],

  // 天盘乙
  [
    // 乙 + 甲
    // { name: '日月并行', description: '阴阳得位，公私皆吉，谋为顺利', nature: 'auspicious' },
    { name: '日月并行', description: '月出沧海，龙凤呈祥。有利合作，合谋，有利文化事来，公谋私皆为吉。', nature: 'auspicious' },

    // 乙 + 乙
    // { name: '日奇伏吟', description: '宜静守，不宜见官谒贵、求名，百事皆阻', nature: 'neutral' },
    { name: '日奇伏吟', description: '奇中伏奇。乙乙比肩，不宜见上层领导、贵人，不宜求名求利，只宜安分守己为吉。', nature: 'neutral' },

    // 乙 + 丙
    // { name: '奇仪顺遂', description: '官职升迁，学术进益，凶星到则主离别', nature: 'auspicious' },
    { name: '奇仪顺遂', description: '乙木生丙火，为奇仪顺遂，吉星迁官晋职，区星夫妻反目离别。为先明后暗之局，声势不久，门宫相生再乘旺相则诸事显扬。若休囚则暗昧阻隔。工作、官职有利，夫占其妻，则必有离隔。', nature: 'auspicious' },

    // 乙 + 丁
    // { name: '奇仪相佐', description: '文书、官司、经商、婚姻皆吉，百事可为', nature: 'auspicious' },
    { name: '奇仪相佐', description: '为奇仪相佐，最利文书、考试，百事可为。有迟中得速之妙。（因乙为曲折，丁为迅速，乙生助丁而丁旺）阴人扶助。门宫相生则大利为主，逢克制则妇人多灾。', nature: 'auspicious' },

    // 乙 + 戊
    // { name: '利阴害阳', description: '门吉尚可，门凶则破财伤人，不宜公开行事', nature: 'inauspicious' },
    { name: '奇入天门', description: '万事皆旺，利见大人，结合门宫生克旺墓以分主客之用。乙木克戊土，为阴害阳门（因戊为阳为天门），利于阴人、阴事、不利阳人、阳事，门吉尚可谋为，门凶、门迫则破财伤人。', nature: 'inauspicious' },

    // 乙 + 己
    // { name: '日奇入墓', description: '被土暗昧，门吉尚可，门凶则诸事不利、昏晦', nature: 'inauspicious' },
    { name: '日奇入墓', description: '有姑嫂相见之情。因戌为乙木之墓，故为日奇入墓，主暗昧阻碍，门凶事必凶，得开门为地遁，得日精之蔽诸事大利。', nature: 'inauspicious' },

    // 乙 + 庚
    // { name: '日奇被刑', description: '争讼财产，夫妻怀私。女子被官司牵连', nature: 'inauspicious' },
    { name: '太白奇合', description: '有以柔制刚之意。主婚姻之喜。但须注意钱财是非，凡事半吉。庚金克刑乙木，故为日奇被刑，为争讼财产，夫妻怀有私意。', nature: 'inauspicious' },

    // 乙 + 辛
    // { name: '青龙逃走', description: '奴仆拐带，六畜皆伤，女弃其夫，男遇多变', nature: 'inauspicious' },
    { name: '青龙逃走', description: '宫门若相生为吉，相克则为逃走，问婚则女避男。问出行则吉利。但易破财。乙为青龙，辛为白虎，乙木被辛金冲克而逃，故为青龙逃走，人亡财破，六畜皆伤。', nature: 'inauspicious' },

    // 乙 + 壬
    // { name: '日奇天罗', description: '尊卑悖乱，官司是非，有人谋害，凡事不宁', nature: 'inauspicious' },
    { name: '奇神入狱', description: '主客均宜固守，主有悖乱之事，防官讼是非，但诸事不实。', nature: 'inauspicious' },

    // 乙 + 癸
    // { name: '日奇地网', description: '遁迹隐形，躲灾避难为佳，退吉进凶', nature: 'neutral' },
    { name: '奇临华盖', description: '宜遁迹修道，退休诸事，避灾则吉。主背明就暗，凡事阻闭之象。若门宫相生，彼此尚吉，克制及临墓绝之地，诸事艰难，且先耗财而后如意。', nature: 'neutral' },
  ],

  // 天盘丙
  [
    // 丙 + 甲 (奇逢重生)
    // { name: '飞鸟跌穴', description: '谋为洞彻，求财大利，不劳而获', nature: 'auspicious' },
    { name: '飞鸟跌穴', description: '主客皆利，为奇门两大吉格之一，筹划设计，百事可为。甲为丙火之母，丙火回到母亲身边，好似飞鸟归巢，故名飞鸟跌穴，百事吉，事业可为，可谋大事。', nature: 'auspicious' },

    // 丙 + 乙
    // { name: '日月并行', description: '阴阳得位，公私皆吉，谋为顺利', nature: 'auspicious' },
    { name: '日月并行', description: '月出沧海，龙凤呈祥。有利合作，合谋，有利文化事来，公谋私皆为吉。', nature: 'auspicious' },

    // 丙 + 丙
    // { name: '月奇悖师', description: '文书逼迫，破耗遗失，为客不利', nature: 'inauspicious' },
    { name: '月奇悖师', description: '为月奇悖师，文书逼迫，破耗遗失。主单据票证不明遗失。', nature: 'inauspicious' },

    // 丙 + 丁
    // { name: '月奇得使', description: '星随月转，贵人提拔，常人平和', nature: 'auspicious' },
    { name: '星奇朱雀', description: '贵人文书吉利，常人平静安乐，得三吉门为天遁。星月生辉，有光亮，美艳之象。有利贵人文书，学业，工作。不利婚姻。', nature: 'auspicious' },

    // 丙 + 戊 (奇逢重生)
    // { name: '飞鸟跌穴', description: '谋为洞彻，求财大利，不劳而获', nature: 'auspicious' },
    { name: '飞鸟跌穴', description: '主客皆利，为奇门两大吉格之一，筹划设计，百事可为。甲为丙火之母，丙火回到母亲身边，好似飞鸟归巢，故名飞鸟跌穴，百事吉，事业可为，可谋大事。', nature: 'auspicious' },

    // 丙 + 己
    // { name: '火悖入刑', description: '囚人刑杖，文书不行，吉凶看门', nature: 'inauspicious' },
    { name: '奇入明堂', description: '有乔迁之喜，文书不利，阻力刑囚，凶多吉少。又为隐明就暗之象，凡事迟滞，恩中招怨。吉门得吉，凶门转区。', nature: 'inauspicious' },    

    // 丙 + 庚
    // { name: '荧入太白', description: '门户破财，盗贼窃私，贼人自去', nature: 'inauspicious' },
    { name: '荧入太白', description: '遭盗遗失，门户破败，家事煎熬，防止外来是非。', nature: 'inauspicious' },

    // 丙 + 辛
    // { name: '月奇相合', description: '谋事成就，病人不凶，化凶为吉', nature: 'auspicious' },
    { name: '奇神生合', description: '恩威并济，礼仪相交，门宫相生，则事情成就，在坎宫则凡事必成，逢克制则调和失败。病人渐好，谋为事成，文状入官。', nature: 'auspicious' }, 

    // 丙 + 壬
    // { name: '火入天网', description: '为客不利，是非颇多，反复不宁', nature: 'inauspicious' },
    {name: '奇神游海', description: '又名火入天网，惟利求官，凡事防不实，为客不利，防轻浮女子，一般人多动荡流离，贵人失名。壬水冲克丙火，故为客不利，是非颇多。', nature: 'inauspicious'},

    // 丙 + 癸 (奇逢华盖)
    // { name: '月奇地网', description: '阴人害事，灾祸颇多，前途不明', nature: 'inauspicious' },
    { name: '月奇地网', description: '诸事得吉门生宫，则名利有成。逢克制则小人当权，灾祸连连，阴人害事，灾祸频生。', nature: 'inauspicious' },
  ],

  // 天盘丁
  [
    // 丁 + 甲
    // { name: '青龙转光', description: '官人升迁，常人威昌，谋望大吉', nature: 'auspicious' },
    { name: '青龙转光', description: '测命遇之大贵，凡事皆吉。又名青龙得光，问官升迁，常人威昌，凶恶不起，须查门宫生克衰旺以分主客。', nature: 'auspicious' },

    // 丁 + 乙
    // { name: '玉女生奇', description: '贵人升迁，婚姻财喜，文书吉', nature: 'auspicious' },
    { name: '玉女奇生格', description: '逢太阴，生门，为人遁吉格，贵人加官晋爵，常人婚姻财帛有喜。', nature: 'auspicious' },   

    // 丁 + 丙
    // { name: '星随月转', description: '贵人高升，常人主悲，变动不安', nature: 'neutral' },
    { name: '奇神合明', description: '星随月转，利于跟随贵人办事，大有作为贵人越级，主客皆利。贵人越级高升，常人乐极生悲，要忍，不然因小的不忍而引起大的不幸。', nature: 'neutral' },

    // 丁 + 丁
    // { name: '星奇伏吟', description: '文书即至，喜事遂心，万事如意', nature: 'auspicious' },
    { name: '奇神相投', description: '又名奇合重阴，主文书证件即至。诸事可谋，喜事从心，万事如意。凡事虽吉，惟恐相争。用兵宜先举，利于为客。', nature: 'auspicious' },

    // 丁 + 戊 (玉女骑龙)
    // { name: '青龙转光', description: '官人升迁，常人威昌，谋望大吉', nature: 'auspicious' },
    { name: '青龙转光', description: '测命遇之大贵，凡事皆吉。又名青龙得光，问官升迁，常人威昌，凶恶不起，须查门宫生克衰旺以分主客。', nature: 'auspicious' },
    
    // 丁 + 己
    // { name: '火入勾陈', description: '奸私仇冤，事因女人，谋为不利', nature: 'inauspicious' },
    { name: '玉女施恩', description: '主有阴私之事，凡事情投意合，须看丁已所临宫门生旺迫制以定主客之动静。因戌为火库，己为勾陈，故为火入勾陈，奸私仇冤，事因女人。', nature: 'inauspicious' },

    // 丁 + 庚
    // { name: '星奇受阻', description: '文书阻隔，消息不通，行人必归', nature: 'inauspicious' },
    { name: '悖格', description: '文书阻隔，凡事难以强图，其事反复不常。若庚临生旺必主大战。详宫门衰旺，分主客之胜负。丁为文书，庚为阻隔之神，故为文书阻隔，行人必归。', nature: 'inauspicious' },

    // 丁 + 辛
    { name: '朱雀入狱', description: '罪人释囚，官人失位，牢狱之灾', nature: 'inauspicious' },

    // 丁 + 壬
    // { name: '奇仪相合', description: '凡事能成，贵人辅助，测婚多苟合', nature: 'auspicious' },
    { name: '奇仪相合', description: '百事有成，贵人辅助。又名玉女乘龙游海，加直符则为得使，主贵人和合。此格常与私情有关。此格于震巽二宫尤利。', nature: 'auspicious' },

    // 丁 + 癸
    // { name: '朱雀投江', description: '文书口舌，音信沉溺，官司词讼', nature: 'inauspicious' },
    { name: '朱雀投江', description: '癸水冲克丁火，为朱雀投江，文书口舌是非，经官动储，词讼不利，音信沉溺不到。文书音信有丢失，谋为不利，如癸为直符则丁奇得使用，丁主动，癸主静，其势搏激，生死关头，详丁癸之生墓，知主客之雌雄。', nature: 'inauspicious' },

  ],

  // 天盘戊
  [
    // 戊 + 甲
    // { name: '青龙返首', description: '大吉大利，若逢击刑则吉事成凶', nature: 'auspicious' },
    { name: '青龙返首', description: '因青龙甲木生助丙火，故为青龙返首，如宫门无克，则大吉大利。如宫门相克，则诸事费力才成。又主土木动作，宅室光辉，父子大利。门克宫则利客，宫克门则利主，但本局虽吉利，却忌讳遇到六仪击刑，门迫以及奇仪入墓。若逢迫墓击刑，吉事成凶。', nature: 'auspicious' },

    // 戊 + 乙
    // { name: '青龙合会', description: '贵人助，合主病多，吉凶看门', nature: 'auspicious' },
    { name: '青龙合会', description: '甲己会合，因甲乙均位于东方青龙之位，所以又叫青龙和会，会得到同事，朋友的帮助，凡事主客均利，有利于谒贵，面试，门吉事也吉，门凶事也区。', nature: 'auspicious' },

    // 戊 + 丙
    // { name: '青龙返首', description: '大吉大利，若逢击刑则吉事成凶', nature: 'auspicious' },
    { name: '青龙返首', description: '因青龙甲木生助丙火，故为青龙返首，如宫门无克，则大吉大利。如宫门相克，则诸事费力才成。又主土木动作，宅室光辉，父子大利。门克宫则利客，宫克门则利主，但本局虽吉利，却忌讳遇到六仪击刑，门迫以及奇仪入墓。若逢迫墓击刑，吉事成凶。', nature: 'auspicious' },

    // 戊 + 丁
    // { name: '青龙耀明', description: '谒贵求名吉，击刑则减吉', nature: 'auspicious' },
    { name: '青龙耀明', description: '因甲木青龙生助丁火，故为青龙耀明，宜见上级领导、贵人、求功名，为事吉利。主得暗助，又主凡事迅速，此格对工作，官职，学业，文化，事业等大利。对占断官司则不利，尤其门凶时则更凶。若值墓迫，招惹是非。', nature: 'auspicious' },    
    
    // 戊 + 戊
    // { name: '青龙伏吟', description: '凡事闭塞，静守为吉，不宜动作', nature: 'neutral' },'
    { name: '青龙入地', description: '甲比肩，名谓伏吟。回环辗转，进退未决，占信，则喜信必来。门合则美，门塞星凶，空有财至。适合养精蓄锐，等待机遇，其意义相当于潜龙勿用。遇此，凡事不利，道路闭塞，以守为好。', nature: 'neutral' },
    
    // 戊 + 己
    // { name: '贵人入狱', description: '公私不利，凡事受阻，需冲开方好', nature: 'inauspicious' },
    { name: '青龙相合', description: '主有财运，婚姻之喜，若门生宫及比合，则主百事吉，门克宫则好事成蹉跎，有始无终。此格不利求贵与面试，因为戌为戊土之墓，故为贵人入狱，公私皆不利。宜踏实稳步，齐心协力。', nature: 'inauspicious' },

    // 戊 + 庚
    // { name: '值符飞宫', description: '换地易迁，吉事不吉，凶事更凶', nature: 'inauspicious' },
    { name: '青龙失势', description: '甲最怕庚金克杀，故为值符飞宫，吉事不吉，区事更凶，求财没利益，测病也主凶，防不测之灾，如入虎穴，如单身探敌宫。又为太白登天门格，如门制宫则凶，如见天辅星，则大利考试。同时，甲庚相冲，飞宫也主换地方。', nature: 'inauspicious' },

    // 戊 + 辛
    // { name: '青龙折足', description: '吉门尚可，凶门失财，防足疾', nature: 'inauspicious' },
    { name: '青龙折足', description: '因辛金克甲木，子午相冲，故为青龙折足，吉门有生肋，尚能谋事，若逢凶门，主招灾、失财或有足疾、折伤。', nature: 'inauspicious' },

    // 戊 + 壬
    // { name: '青龙天牢', description: '诸事不利，投资亏本，测病主凶', nature: 'inauspicious' },
    { name: '青龙入狱', description: '因壬为天牢，甲为青龙，故为青龙入天牢，凡阴阳事皆不吉利。一切事体不利，被客观环境和条件所限制。门克宫则利客，宫克门并且壬值得令之时，则利主，此格多主耗散。', nature: 'inauspicious' },

    // 戊 + 癸
    // { name: '青龙华盖', description: '为利而合，吉凶看门，事有纠缠', nature: 'neutral' },
    { name: '青龙华盖', description: '首尾无应，事有分歧，因甲为青龙，癸为天网，又为华盖，故为青龙华盖，又戊癸相合，故逢吉门为吉，可招福临门。门宫生比则诸事大吉，若门克宫则成中有败。本格适合占测婚姻感情与合作交易。逢凶门者事多不利，为凶。', nature: 'neutral' },
  ],
  // 天盘己
  [
    // 己 + 甲
    // { name: '犬遇青龙', description: '门吉大吉，门凶徒劳，谋为可行', nature: 'neutral' },
    { name: '犬遇青龙', description: '万事得吉祥，谋为皆遂意，又名明堂从禄格，若临生旺之宫，主客均利。因戌为犬，门吉为谋望遂意，上人见喜；若门凶，枉费心机。', nature: 'neutral' },

    // 己 + 乙
    // { name: '地户逢星', description: '墓神不明，遁迹隐形，前途渺茫', nature: 'inauspicious' },
    { name: '日入地户', description: '凡事暗昧难图，有蒙蔽侵犯之意。结合已乙所临宫门之生旺墓迫，分主客而论之。因戌为乙木之墓，己又为地户，故墓神不明，地户逢星，宜遁迹隐形为利。', nature: 'inauspicious' },
    
    // 己 + 丙
    // { name: '火悖地户', description: '男遭冤害，女遭淫污，感情易变', nature: 'inauspicious' },
    { name: '火悖地户', description: '男子占之有人相害，女子有感情是非，恩中成怨，凡事屈抑难伸，先暗后明，利于为客。如已为值符则按青龙回首格论。', nature: 'inauspicious' },

    // 己 + 丁 (星奇入墓)
    // { name: '朱雀入墓', description: '文书词讼先曲后直，终必有理', nature: 'neutral' },
    { name: '朱雀入墓', description: '凡事虽吉，然先费后益，利为客。文状词讼先曲而后直。因戌为火墓，故名为朱雀入墓。', nature: 'neutral' },
    
    // 己 + 戊
    // { name: '犬遇青龙', description: '门吉大吉，门凶徒劳，谋为可行', nature: 'neutral' },
    { name: '犬遇青龙', description: '万事得吉祥，谋为皆遂意，又名明堂从禄格，若临生旺之宫，主客均利。因戌为犬，门吉为谋望遂意，上人见喜；若门凶，枉费心机。', nature: 'neutral' },

    // 己 + 己
    // { name: '地户逢鬼', description: '百事不遂，病者危险，不可谋为', nature: 'inauspicious' },
    { name: '地户逢鬼', description: '病者发凶或必死，百事不遂，暂不谋为，谋为则凶。自屈难伸，进退不决，宜固守，旧事物。', nature: 'inauspicious' },

    // 己 + 庚 （刑格返名）
    // { name: '刑格反名', description: '谋为徒劳，先动不利，谨防谋害', nature: 'inauspicious' },
    { name: '刑格反名', description: '词讼先动者不利，如临阴星则有谋害之情。男子占之宜静，女子占之主私情。', nature: 'inauspicious' },

    // 己 + 辛
    // { name: '游魂入墓', description: '人鬼相侵，鬼魅作祟，凡事谨慎', nature: 'inauspicious' },
    { name: '游魂入墓', description: '易遭阴人作崇。占风水逢之家有阴人做怪，小口有欠。', nature: 'inauspicious' },

    // 己 + 壬
    // { name: '地网高张', description: '奸情伤杀，事多变动，小人当道', nature: 'inauspicious' },
    { name: '地网高张', description: '女子奸恶，男子遭伤，门迫星凶，两人俱亡，百事无成。', nature: 'inauspicious' },

    // 己 + 癸
    // { name: '地刑玄武', description: '疾病垂危，囚狱词讼，事关私欲', nature: 'inauspicious' },
    { name: '地刑玄武', description: '男女疾病垂危，病不能语，凡事反复难成，详门宫生克以定主客胜负。有囚狱词讼之灾。', nature: 'inauspicious' },
  ],

  // 天盘庚
  [
    // 庚 + 甲
    // { name: '天乙伏宫', description: '破财伤人，不利合作，百事皆凶', nature: 'inauspicious' },
    { name: '天乙伏宫', description: '庚金克甲木，百事不可谋，大凶。先述后得，阳时利客，可求财利，余财百事难为。', nature: 'inauspicious' },

    // 庚 + 乙
    // { name: '太白逢星', description: '退吉进凶，夫妻不和，牵绊不顺', nature: 'inauspicious' },
    { name: '太白逢星', description: '退吉进凶，谋为不利。庚乙合化金，因此庚加乙在乾兑二宫尤吉。', nature: 'inauspicious' },

    // 庚 + 丙
    // { name: '太白入荧', description: '占贼必来，为客进利，为主破财', nature: 'neutral' },
    { name: '太白入荧', description: '如庚为直符，则为青龙回首。占贼必来，凡事费力，易破财。失亡被盗，难获难寻。为客进利，为主破财。', nature: 'neutral' },

    // 庚 + 丁
    // { name: '亭亭之格', description: '金屋藏娇，门吉尚吉，私匿官司', nature: 'neutral' },
    { name: '亭亭之格', description: '因私匿或男女关系起官司是非，门吉有救，门区事必区。凡为不利，有更改之象，文状争论，私匿之情。问婚姬易有第三者女人介入。如庚临生旺则为暴落袭主之象。', nature: 'neutral' },

    // 庚 + 戊
    // { name: '天乙伏宫', description: '破财伤人，不利合作，百事皆凶', nature: 'inauspicious' },
    { name: '天乙伏宫', description: '庚金克甲木，百事不可谋，大凶。先述后得，阳时利客，可求财利，余财百事难为。', nature: 'inauspicious' },

    // 庚 + 己 (官符刑格)
    // { name: '官府刑格', description: '私欲伤害，官讼判刑，主客不利', nature: 'inauspicious' },
    { name: '官府刑格', description: '主有官司口舌，因官讼被判刑，官司遭重，狱囚之人，难有伸理。', nature: 'inauspicious' },

    // 庚 + 庚
    // { name: '太白同宫', description: '兄弟不和，官灾横祸，变动争财', nature: 'inauspicious' },
    { name: '太白同宫', description: '又名战格，官灾横祸，兄弟或同辈朋友相冲撞，不利为事。百日后方能消除。有自作愤激之情，为自刑之象', nature: 'inauspicious' },

    // 庚 + 辛
    // { name: '白虎干格', description: '远行不利，车折马死，诸事灾殃', nature: 'inauspicious' },
    { name: '白虎干格', description: '不宜远行，远行车折马伤，求财更为大凶。两强相持之象，主伤亡车祸，感情分手，有事难休。凡事必有争论，阳时利为客。', nature: 'inauspicious' },

    // 庚 + 壬
    // { name: '移荡之格', description: '远行迷失，音信皆阻，多主变动', nature: 'inauspicious' },
    { name: '小格', description: '壬水主流动，庚为阻隔之神，故远行道路迷失，男女音信难通。占信息道路不通。如再逢伤门主灾病，逢死门主丧事阻隔。', nature: 'inauspicious' },   

    // 庚 + 癸
    // { name: '大格', description: '行人不至，生产皆伤，官司破财', nature: 'inauspicious' },
    { name: '大格', description: '主信息远。人情悖逆，谋为多阻。因寅申相冲克，庚为道路，故多主车祸，行人不至，官事不止，大凶。防不测之事，阳时利为各。', nature: 'inauspicious' },
  ],
  // 天盘辛
  [
    // 辛 + 甲
    // { name: '困龙被伤', description: '屈抑守分，妄动祸殃，官司破财', nature: 'inauspicious' },
    { name: '龙虎争强', description: '辛金克甲木，子午又相冲，故为困龙被伤，主官司破财，屈抑守分尚可，妄动则带来祸殃。凡事不和，求谋不利，龙困遭伤，因此易损钱财，伤四肢，男子逢之尤忌，射物为缺损物品。', nature: 'inauspicious' },

    // 辛 + 乙
    // { name: '白虎猖狂', description: '家破人亡，远行多殃，男弃其妻', nature: 'inauspicious' },
    { name: '白虎猖狂', description: '辛金冲克乙木，故名为白虎猖狂，家败人亡，远行多灾殃测婚离散，主因男人。有走失破财之事，所谋难成。如辛乘旺气而乙木逢生则得财利。', nature: 'inauspicious' },

    // 辛 + 丙
    // { name: '干合悖师', description: '合中有乱，因财致讼，吉凶看门', nature: 'neutral' },
    { name: '干合悖师', description: '门吉则事吉，门凶则事凶，测事易因财物致讼。辛为直符加丙则为青龙回首，有威权作合之象，主炉治之事，凡事吉昌。占雨无，占晴早，易因财而致讼。', nature: 'neutral' },

    // 辛 + 丁
    // { name: '狱神得奇', description: '经商倍利，囚人赦免，意外收获', nature: 'auspicious' },
    { name: '狱神得奇', description: '辛为狱神，丁为星奇，故名为狱神得奇。经商获倍利，囚人逢赦，但防受惊，又主凡事有始无终，内多耗散。如门生宫，宫克门大利主，如门克宫，丁逢衰墓则只宜固守。', nature: 'auspicious' },

    // 辛 + 戊
    // { name: '困龙被伤', description: '屈抑守分，妄动祸殃，官司破财', nature: 'inauspicious' },
    { name: '龙虎争强', description: '辛金克甲木，子午又相冲，故为困龙被伤，主官司破财，屈抑守分尚可，妄动则带来祸殃。凡事不和，求谋不利，龙困遭伤，因此易损钱财，伤四肢，男子逢之尤忌，射物为缺损物品。', nature: 'inauspicious' },

    // 辛 + 己
    // { name: '入狱自刑', description: '奴仆背主，狱讼难伸，自错破财', nature: 'inauspicious' },
    { name: '入狱自刑', description: '辛为罪人，戌为午火之库，故名为入狱自刑，奴仆背主，有苦诉讼难伸。入狱自弄诉讼难伸，凡事主破财，暗里灾殃，凡事费力方成，利于为客。', nature: 'inauspicious' },

    // 辛 + 庚
    // { name: '白虎出力', description: '刀光血影，主客相残，退避尚可', nature: 'inauspicious' },
    { name: '白虎出力', description: '刀刃相交，主客相残，逊让退步稍可，两女争男，皆因酒色，防凶祸。凡谋不利，凡事反复迟滞，忧惊。', nature: 'inauspicious' },

    // 辛 + 辛
    // { name: '伏吟天庭', description: '公废私就，讼狱由己，自罹罪名', nature: 'inauspicious' },
    { name: '伏吟天庭', description: '公废私就，讼狱自罹罪名。凡事自败，有势难行。柔奸无用，门生宫则利主。宜收敛，凡事防自身、内部发生变化。', nature: 'inauspicious' },

    // 辛 + 壬
    // { name: '凶蛇入狱', description: '两男争女，讼狱不息，先动失理', nature: 'inauspicious' },
    { name: '蛇入狱刑', description: '辛为牢狱，故名为凶蛇入狱，两男争女，讼狱不息，先动失理。凡事不利所谋，难成，防欺诈。', nature: 'inauspicious' },

    // 辛 + 癸
    // { name: '天牢华盖', description: '误入天网，动辄乖张，日月失明', nature: 'inauspicious' },
    { name: '天牢华盖', description: '日月失明，误入天网，动止乖张。自投罗网，凡事先塞而后通。女子逢之有利，男子损财，易有酒食喜庆之事到来', nature: 'inauspicious' },
  ],
  // 天盘壬
  [
    // 壬 + 甲
    // { name: '小蛇化龙', description: '升迁得势，男人发达，女产婴童', nature: 'auspicious' },
    { name: '蛇化为龙', description: '因壬为小蛇，甲为青龙，故为小蛇化龙，凡事有阻谋，为暗昧。女子逢之则喜庆之事。男子遇之有始无终。', nature: 'auspicious' },

    // 壬 + 乙
    // { name: '小蛇得势', description: '女子温柔，男子发达，产子顺利', nature: 'auspicious' },
    { name: '小蛇得势', description: '女人柔顺，男人通旺，测孕育生子，禄马光华。犯空亡，凡为不利。', nature: 'auspicious' },

    // 壬 + 丙
    // { name: '水蛇入火', description: '官灾刑禁，络绎不绝，两败俱伤', nature: 'inauspicious' },
    { name: '水蛇入火', description: '因壬丙相冲克，故主官灾刑禁，络绎不绝。凡事不利。如壬为直符，则为青龙回首格，主吉利，贵人来助。', nature: 'inauspicious' },

    // 壬 + 丁
    // { name: '干合蛇刑', description: '文书牵连，贵人匆匆，男吉女凶', nature: 'neutral' },
    { name: '干合蛇刑', description: '文语书牵连，文书财喜，大宜女子，贵人官禄，常人平安。', nature: 'neutral' },

    // 壬 + 戊
    // { name: '小蛇化龙', description: '升迁得势，男人发达，女产婴童', nature: 'auspicious' },
    { name: '蛇化为龙', description: '因壬为小蛇，甲为青龙，故为小蛇化龙，凡事有阻谋，为暗昧。女子逢之则喜庆之事。男子遇之有始无终。', nature: 'auspicious' },

    // 壬 + 己
    // { name: '反吟蛇刑', description: '官司败诉，大祸将至，顺守可吉', nature: 'inauspicious' },
    { name: '凶蛇入狱', description: '主官讼败诉，大祸将至，顺守可吉，妄动必区。', nature: 'inauspicious' },

    // 壬 + 庚 (太白骑蛇)
    // { name: '太白擒蛇', description: '难以发展，刑狱公平，立判邪正', nature: 'inauspicious' },
    { name: '太白擒蛇', description: '因庚为太白。刑狱公明，好分正邪。如逢伤死二门，王杀伤之祸。', nature: 'inauspicious' },

    // 壬 + 辛
    // { name: '螣蛇相缠', description: '琐事缠绕，动荡不安，被人欺瞒', nature: 'inauspicious' },
    { name: '螣蛇相缠', description: '因辛金入辰水之墓，故名为腾蛇相缠，纵得吉门，亦不能安宁，若有谋望，被人欺瞒。门制宫祸尤速，门生宫则可免祸侵。防内部欺瞒，主反复不定。', nature: 'inauspicious' },
    
    // 壬 + 壬
    // { name: '天狱自刑', description: '求谋无成，内起祸患，诸事破败', nature: 'inauspicious' },
    {name: '蛇入地罗', description: '外人缠绕，内事索索，吉门吉星，庶免蹉跎。凡事破败难定', nature: 'inauspicious'},
    
    // 壬 + 癸
    // { name: '幼女奸淫', description: '奸私隐情，家丑外扬，测婚不洁', nature: 'inauspicious' },
    { name: '腾蛇飞空', description: '主有家丑外扬之事发生，门吉星凶，易反福内祸。', nature: 'inauspicious' },
  ],

  // 天盘癸
  [
    // 癸 + 甲
    // { name: '天乙合会', description: '婚姻财喜，合作投资，吉门可行', nature: 'auspicious' },
    { name: '天乙合会', description: '吉门宜求财，婚姻喜美，吉人赞助成合。若门凶迫制，反祸官非。凡事虽吉，只宜阴谋私合，也有恩怨交加之象。', nature: 'auspicious' },

    // 癸 + 乙
    // { name: '华盖逢星', description: '贵人禄位，常人平安，吉凶看门', nature: 'neutral' },
    { name: '华盖逢星', description: '贵人禄位，常人平安。门吉则吉，门凶则区。日沉九地，有男性贵人扶持，暗中生助，但嫌迟疑不速。', nature: 'neutral' },

    // 癸 + 丙
    // { name: '华盖悖师', description: '贵贱不利，反凶为吉，因势利导', nature: 'neutral' },
    { name: '华盖悖师', description: '贵贱逢之皆不利，唯上人见喜。凡事阴塞，贵人受官司，小人得依，若癸为直符，则为青龙回首格，主吉庆。', nature: 'neutral' },

    // 癸 + 丁
    // { name: '螣蛇夭矫', description: '文书官司，口舌是非，火焚难逃', nature: 'inauspicious' },
    { name: '螣蛇夭矫', description: '文书官司，火焚也逃不掉。凡事不利，求吉反区，成不利文书，合同，官司，合作。', nature: 'inauspicious' },

    // 癸 + 戊
    // { name: '天乙合会', description: '婚姻财喜，合作投资，吉门可行', nature: 'auspicious' },
    { name: '天乙合会', description: '吉门宜求财，婚姻喜美，吉人赞助成合。若门凶迫制，反祸官非。凡事虽吉，只宜阴谋私合，也有恩怨交加之象。', nature: 'auspicious' },

    // 癸 + 己
    // { name: '华盖地户', description: '阴阳不和，音信皆阻，躲避为吉', nature: 'inauspicious' },
    { name: '华盖地户', description: '男女测之，音信皆阻，此格躲穴避难方为吉。得吉门尚可为之。', nature: 'inauspicious' },

    // 癸 + 庚
    // { name: '太白入网', description: '吉事成空，暴力争讼，自罹罪责', nature: 'inauspicious' },
    { name: '太白入网', description: '主以暴力争讼，自罹罪责。凡谋事无成，吉事成空。', nature: 'inauspicious' },

    // 癸 + 辛
    // { name: '网盖天牢', description: '官司败诉，死罪难逃，测病大凶', nature: 'inauspicious' },
    { name: '网盖天牢', description: '主官司败诉，死罪难逃；测病亦大凶。凡事费力而后有成，其究竟是天牢还是受恩主要通过八神和用神总体来识别。', nature: 'inauspicious' },

    // 癸 + 壬
    // { name: '复见螣蛇', description: '嫁娶重婚，后嫁无子，不保年华', nature: 'inauspicious' },
    { name: '复见螣蛇', description: '主嫁娶重婚，后嫁无子，不保年华。凡事不利，且无定见，上下蒙蔽。阴人绝子，嫁娶重婚，不保年华', nature: 'inauspicious' },

    // 癸 + 癸
    // { name: '天网四张', description: '行人失伴，病讼皆伤，不可谋为', nature: 'inauspicious' },
    { name: '天网四张', description: '主行人失伴，病讼皆伤。凡事重重闭塞，屈抑不伸，宜伏匿积水开渠。', nature: 'inauspicious' },
  ],
];

/**
 * 获取十干克应
 * @param skyStem 天盘干
 * @param earthStem 地盘干
 */
export const getKeYing = (skyStem: string, earthStem: string): KeYingInfo | null => {
  const skyIdx = STEM_INDEX[skyStem];
  const earthIdx = STEM_INDEX[earthStem];
  
  if (skyIdx === undefined || earthIdx === undefined) {
    return null;
  }
  
  return KE_YING_DATA[skyIdx][earthIdx];
};

/**
 * 获取宫位所有十干克应（包含多个天盘干和地盘干的组合）
 */
export const getPalaceKeYing = (
  skyStem: string,
  skyStem2: string | undefined,
  earthStem: string,
  earthStem2: string | undefined
): { sky: string; earth: string; keYing: KeYingInfo }[] => {
  const results: { sky: string; earth: string; keYing: KeYingInfo }[] = [];
  
  const skyStems = [skyStem];
  if (skyStem2) skyStems.push(skyStem2);
  
  const earthStems = [earthStem];
  if (earthStem2) earthStems.push(earthStem2);
  
  for (const sky of skyStems) {
    for (const earth of earthStems) {
      const keYing = getKeYing(sky, earth);
      if (keYing) {
        results.push({ sky, earth, keYing });
      }
    }
  }
  
  return results;
};
