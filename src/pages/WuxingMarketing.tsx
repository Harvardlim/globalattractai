import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, Flame, Droplets, TreePine, Mountain, Coins,
  AlertTriangle, CheckCircle2, Star, Quote, ArrowRight,
  Sparkles, Target, TrendingUp, Heart, Shield, Zap,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PreLoginFooter from '@/components/PreLoginFooter';
import PreLoginNav from '@/components/PreLoginNav';
import wuxingHero from '@/assets/wuxing-hero.jpg';

const faqs = [
  { q: '五行营销适合什么类型的人？', a: '五行营销适合所有从事营销、销售、创业的人士。无论你是个人创业者、团队管理者还是企业主，都可以通过五行分析找到最适合自己的营销方式。' },
  { q: '五行分析的准确度如何？', a: '五行分析基于千年传承的中华命理体系，结合AI智能算法，准确度非常高。我们的用户普遍反馈分析结果与自身情况高度吻合。' },
  { q: '我需要提供什么信息来做分析？', a: '您只需要提供准确的出生日期和时间即可。我们的系统会自动计算您的五行属性和能量分布。' },
  { q: '五行营销和传统营销有什么区别？', a: '传统营销是千人一面的方法论，五行营销则是根据每个人的天赋能量量身定制的个性化策略。它帮助你找到最适合自己的赛道，而不是盲目模仿他人。' },
  { q: '团队分析怎么做？', a: '团队分析需要每位成员的出生信息。我们会分析每个人的五行属性，然后给出最佳的岗位分配和协作建议，让团队效能最大化。' },
  { q: '如何联系你们的团队？', a: '您可以通过页面上的WhatsApp按钮直接联系我们的团队，我们会在24小时内回复您的咨询。' },
];

const elements = [
  { name: '木', label: 'Wood', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: TreePine, traits: '仁慈 · 成长 · 创造力', desc: '木行人善于规划与创新，适合开拓新市场、内容创作、品牌建设。' },
  { name: '火', label: 'Fire', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: Flame, traits: '热情 · 领导力 · 感召力', desc: '火行人天生具有感染力，擅长演讲、直播、社群运营和团队激励。' },
  { name: '土', label: 'Earth', color: 'text-[hsl(var(--qimen-gold))]', bg: 'bg-[hsl(var(--qimen-gold)/0.1)]', border: 'border-[hsl(var(--qimen-gold)/0.3)]', icon: Mountain, traits: '信用 · 稳重 · 包容', desc: '土行人重信守诺，适合客户维护、售后服务、建立长期信任关系。' },
  { name: '金', label: 'Metal', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30', icon: Coins, traits: '果断 · 精准 · 执行力', desc: '金行人做事利落高效，擅长谈判成交、精准投放、业绩冲刺。' },
  { name: '水', label: 'Water', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Droplets, traits: '智慧 · 灵活 · 洞察力', desc: '水行人善于观察与变通，适合市场分析、策略布局、危机公关。' },
];

const painPoints = [
  '花了大量广告费，却始终找不到精准客户？',
  '团队执行力不够，业绩总是上不去？',
  '营销策略千篇一律，缺乏个性化方案？',
  '不了解自己的优势，总在用错误的方式做营销？',
  '团队成员互相不配合，沟通频繁出问题？',
];

const benefits = [
  { icon: Target, title: '精准定位', desc: '根据五行属性，找到最适合你的营销赛道，不再盲目跟风。' },
  { icon: TrendingUp, title: '业绩提升', desc: '顺应自身能量，用对的方式做营销，业绩自然水到渠成。' },
  { icon: Heart, title: '团队和谐', desc: '了解每个成员的五行特质，合理分工，发挥最大团队效能。' },
  { icon: Shield, title: '风险规避', desc: '五行相生相克的智慧，帮你避开商业陷阱，降低决策风险。' },
  { icon: Sparkles, title: '品牌赋能', desc: '用五行能量打造品牌调性，让品牌形象更有辨识度和吸引力。' },
  { icon: Zap, title: '快速突破', desc: '找到你的能量爆发点，在关键时刻做出关键动作，实现突破。' },
];

const testimonials = [
  {
    name: '陈总',
    role: '电商创业者',
    quote: '之前一直在烧钱投广告，效果很差。通过五行分析发现我是"水"型人，更适合做内容营销和口碑裂变。调整策略后，3个月业绩翻了2倍，广告费反而省了60%！',
  },
  {
    name: '林女士',
    role: '保险团队长',
    quote: '团队30多人，以前总觉得管不好。做了五行团队分析后，把"火"型人放在前端开拓，"土"型人做客户维护，"金"型人负责成交。团队业绩直接从垫底冲到了全区前三！',
  },
  {
    name: '黄先生',
    role: '品牌顾问',
    quote: '作为咨询师，五行营销体系让我的服务有了全新的维度。客户反馈非常好，觉得分析特别精准，回头率和转介绍率都大幅提升。',
  },
];

const steps = [
  { num: '01', title: '五行测评', desc: '通过出生信息精准分析你的五行属性与能量分布。' },
  { num: '02', title: '能量解读', desc: 'AI智能解读你的五行优势、短板和发展方向。' },
  { num: '03', title: '策略定制', desc: '根据五行特质，量身定制个性化营销策略方案。' },
  { num: '04', title: '实战落地', desc: '跟随五行节律，选择最佳时机执行，事半功倍。' },
];

export default function WuxingMarketing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PreLoginNav />

      {/* Hero */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wuxingHero})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-xl">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              五行 × 营销 × AI
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 flex flex-col gap-4">
              <span>
                用对<span className="text-[hsl(var(--qimen-gold))]">五行能量</span>
              </span>
              <span>做对营销</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              每个人天生自带五行密码。找到你的能量属性，
              顺势而为做营销，业绩自然水到渠成。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-10 text-base" asChild>
                <a href="https://wa.me/60143686319" target="_blank" rel="noopener noreferrer">
                  联系我们
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-base" onClick={() => {
                document.getElementById('wuxing-elements')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 md:py-28 bg-destructive/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">你是否也遇到这些问题？</h2>
            <p className="text-muted-foreground">
              如果你有以下 <strong>1个以上</strong> 的困扰，说明你可能一直在用错误的方式做营销！
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {painPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-card p-5">
                <span className="text-destructive font-bold text-xl mt-0.5">✕</span>
                <p className="text-base">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution intro */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">解决方案</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 flex flex-col gap-2">
            <span>别担心！五行营销帮你找到</span>
            <span>属于你的成功密码</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            五行营销是基于中华千年智慧的个性化营销体系。通过分析你的五行能量属性，
            找到最适合你的营销方式、最佳合作伙伴和最有利的行动时机。
          </p>
          <p className="text-lg font-semibold text-[hsl(var(--qimen-gold))]">
            顺应天时 · 发挥本性 · 事半功倍
          </p>
        </div>
      </section>

      {/* Five Elements Cards */}
      <section id="wuxing-elements" className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">五行能量</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              你属于哪一个五行？
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              每种五行能量都有独特的营销优势，了解自己才能发挥最大潜力。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {elements.map((el) => (
              <div key={el.name} className={`rounded-2xl border ${el.border} ${el.bg} p-6 text-center hover:shadow-lg transition-all duration-300`}>
                <el.icon className={`h-10 w-10 ${el.color} mx-auto mb-3`} />
                <h3 className={`text-3xl font-bold ${el.color} mb-1`}>{el.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{el.label}</p>
                <p className="text-sm font-medium mb-3">{el.traits}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{el.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">使用流程</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">四步开启五行营销</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <span className="text-6xl font-bold text-[hsl(var(--qimen-gold))] opacity-20">{s.num}</span>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-6 h-5 w-5 text-muted-foreground/30" />
                )}
                <h3 className="text-lg font-semibold mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">核心优势</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">五行营销能为你带来什么？</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--qimen-gold)/0.15)] flex items-center justify-center mb-4">
                  <b.icon className="h-6 w-6 text-[hsl(var(--qimen-gold))]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">用户真实反馈</h2>
            <p className="text-muted-foreground">来自不同行业的成功案例</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
                <Quote className="h-8 w-8 text-[hsl(var(--qimen-gold)/0.3)] mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-10 w-10 rounded-full bg-[hsl(var(--qimen-gold)/0.2)] flex items-center justify-center text-sm font-bold text-[hsl(var(--qimen-gold))]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">我们的使命</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight flex flex-col gap-1">
                <span>让每个人</span>
                <span>找到属于自己的营销之道</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                我们相信，成功的营销不是模仿别人，而是找到最适合自己的方式。
                五行营销体系将千年智慧与现代AI技术相结合，帮助每一位创业者和营销人发现自己的天赋优势。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                不再盲目跟风，不再浪费资源。用对的方式，做对的事，成为最好的自己。
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">我们的愿景</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight flex flex-col gap-1">
                <span>用五行智慧</span>
                <span>重新定义营销</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                当西方营销理论遇上东方五行智慧，一套全新的个性化营销体系应运而生。
                我们的愿景是让五行营销成为华人商业世界的标配工具。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                从个人品牌到团队管理，从客户分析到市场策略，
                五行智慧无处不在，助你在商海中乘风破浪。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${wuxingHero})` }} />
            <div className="relative z-10">
              <Star className="h-10 w-10 text-primary-foreground mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                你的五行能量密码是什么？
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto leading-relaxed">
                立即测评你的五行属性，获取专属营销策略方案。
                找到属于你的成功之道，让业绩自然增长！
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-10 text-base"
                asChild
              >
                <a href="https://wa.me/60143686319" target="_blank" rel="noopener noreferrer">
                  预约我们的五行营销课程
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/60143686319"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg transition-transform active:scale-95"
        aria-label="Contact via WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* FAQs */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">常见问题</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">FAQ</h2>
            <p className="text-muted-foreground">关于五行营销的常见问题解答</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card px-6">
                <AccordionTrigger className="text-left font-semibold text-sm md:text-base hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <PreLoginFooter />
    </div>
  );
}
