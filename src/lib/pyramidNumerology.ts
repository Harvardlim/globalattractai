// 生命密码金字塔数字学 (Life Code Pyramid Numerology)

export function reduce(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return n === 0 ? 9 : n;
}

export interface LifeCodeResult {
  pairs: string[];
  I: number; J: number; K: number; L: number;
  M: number; N: number;
  O: number;
  T: number; S: number; U: number;
  V: number; W: number; X: number;
  P: number; Q: number; R: number;
  innerNumber: number;
  outerNumber: number;
  subconsciousNumber: number;
  lateYearsCode: string;
  stars: { top: number; bottomLeft: number; bottomRight: number };
  combinedCodes: number[][];
}

export function calculateLifeCode(date: Date): LifeCodeResult {
  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear().toString().padStart(4, '0');
  const cc = yyyy.slice(0, 2);
  const yy = yyyy.slice(2, 4);
  const pairs = [dd, mm, cc, yy];

  const I = reduce(+dd[0] + +dd[1]);
  const J = reduce(+mm[0] + +mm[1]);
  const K = reduce(+cc[0] + +cc[1]);
  const L = reduce(+yy[0] + +yy[1]);
  const M = reduce(I + J);
  const N = reduce(K + L);
  const O = reduce(M + N);

  const T = reduce(M + I);
  const S = reduce(M + J);
  const U = reduce(T + S);

  const V = reduce(N + K);
  const W = reduce(N + L);
  const X = reduce(V + W);

  const P = reduce(N + O);
  const Q = reduce(M + O);
  const R = reduce(P + Q);

  const innerNumber = reduce(O + M + N);
  const outerNumber = reduce(U + R + X);
  const subconsciousNumber = reduce(L + I + O);
  const lateYearsCode = `${V}${W}${X}`;

  const stars = { top: O, bottomLeft: I, bottomRight: L };

  const combinedCodes = [
    [I, J, M], [K, L, N], [M, N, O], [J, M, S],
    [I, M, T], [T, S, U], [N, O, P], [M, O, Q],
    [P, Q, R], [K, N, V], [L, N, W], [V, W, X],
  ];

  return {
    pairs, I, J, K, L, M, N, O, T, S, U, V, W, X, P, Q, R,
    innerNumber, outerNumber, subconsciousNumber, lateYearsCode,
    stars, combinedCodes,
  };
}

export function getNumberMeaning(num: number, lang: string): { title: string; description: string } {
  const meanings: Record<number, Record<string, { title: string; description: string }>> = {
    1: {
      zh: { title: '领导 · 创造', description: '创造力、自信、领导力、独立自主' },
      en: { title: 'Leadership · Creation', description: 'Creativity, confidence, leadership, independence' },
      ms: { title: 'Kepimpinan · Kreativiti', description: 'Kreativiti, keyakinan, kepimpinan, kebebasan' },
    },
    2: {
      zh: { title: '沟通 · 洞察', description: '沟通力、洞察力、敏感体贴、善于表达' },
      en: { title: 'Communication · Insight', description: 'Communication, insight, sensitivity, expressiveness' },
      ms: { title: 'Komunikasi · Wawasan', description: 'Komunikasi, wawasan, sensitiviti, ekspresi' },
    },
    3: {
      zh: { title: '行动 · 表达', description: '行动力、表达力、乐观积极、艺术才华' },
      en: { title: 'Action · Expression', description: 'Action, expression, optimism, artistic talent' },
      ms: { title: 'Tindakan · Ekspresi', description: 'Tindakan, ekspresi, optimisme, bakat seni' },
    },
    4: {
      zh: { title: '规划 · 安全', description: '学习力、条理性、策划能力、安全感' },
      en: { title: 'Planning · Security', description: 'Learning, organization, planning, security' },
      ms: { title: 'Perancangan · Keselamatan', description: 'Pembelajaran, organisasi, perancangan, keselamatan' },
    },
    5: {
      zh: { title: '方向 · 自由', description: '多元化、方向感、审美观、追求自由' },
      en: { title: 'Direction · Freedom', description: 'Diversity, direction, aesthetics, freedom' },
      ms: { title: 'Arah · Kebebasan', description: 'Kepelbagaian, arah, estetika, kebebasan' },
    },
    6: {
      zh: { title: '财富 · 关爱', description: '可依赖、财富力、智慧关爱、家庭观念' },
      en: { title: 'Wealth · Care', description: 'Reliability, wealth, wisdom, family values' },
      ms: { title: 'Kekayaan · Kasih', description: 'Kebolehpercayaan, kekayaan, kebijaksanaan, keluarga' },
    },
    7: {
      zh: { title: '博学 · 幸运', description: '善分析、直觉强、人缘好、贵人运' },
      en: { title: 'Knowledge · Fortune', description: 'Analytical, intuitive, good connections, luck' },
      ms: { title: 'Ilmu · Tuah', description: 'Analitikal, intuitif, hubungan baik, tuah' },
    },
    8: {
      zh: { title: '责任 · 权力', description: '责任感、影响力、执着野心、事业心' },
      en: { title: 'Responsibility · Power', description: 'Responsibility, influence, ambition, career-driven' },
      ms: { title: 'Tanggungjawab · Kuasa', description: 'Tanggungjawab, pengaruh, cita-cita, kerjaya' },
    },
    9: {
      zh: { title: '智慧 · 灵性', description: '杂学家、有灵性、慈悲心、机会多' },
      en: { title: 'Wisdom · Spirituality', description: 'Versatile, spiritual, compassionate, opportunistic' },
      ms: { title: 'Kebijaksanaan · Kerohanian', description: 'Serba boleh, rohani, belas kasihan, peluang' },
    },
  };
  return meanings[num]?.[lang] || meanings[num]?.zh || { title: String(num), description: '' };
}

export function getCombinedCodeMeaning(code: number[], lang: string): { title: string; description: string } {
  const key = code.join('');
  const combinedMeanings: Record<string, Record<string, { title: string; description: string }>> = {
    // Common 3-digit combinations with interpretations
  };
  // Fallback: describe based on individual numbers
  const parts = code.map(n => getNumberMeaning(n, lang));
  const titles = parts.map(p => p.title.split('·')[0].trim()).join(' + ');
  const descs = parts.map(p => p.description).join('；');
  return { title: titles, description: descs };
}

// Keep old exports for backward compatibility
export interface PyramidResult {
  rows: number[][];
  topNumber: number;
}

export function calculatePyramid(date: Date): PyramidResult {
  const result = calculateLifeCode(date);
  return {
    rows: [[result.I, result.J, result.K, result.L], [result.M, result.N], [result.O]],
    topNumber: result.O,
  };
}
