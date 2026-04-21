import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Compass, Brain, Users, Calendar, Sparkles, ChevronRight, Shield, Zap, BarChart3 } from 'lucide-react';
import PreLoginFooter from '@/components/PreLoginFooter';
import PreLoginNav from '@/components/PreLoginNav';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  {
    icon: Compass,
    title: '奇门遁甲',
    desc: 'AI智能排盘与解读，支持阴盘飞宫，实时起盘与命盘分析。',
  },
  {
    icon: Brain,
    title: 'AI智能解读',
    desc: '基于大语言模型的玄学分析引擎，精准解读命理信息。',
  },
  {
    icon: Users,
    title: '客户管理',
    desc: '高效管理客户档案、咨询记录，一站式服务体验。',
  },
  {
    icon: Calendar,
    title: '万年历',
    desc: '精准的干支历法计算，节气、日柱、时柱一目了然。',
  },
  {
    icon: BarChart3,
    title: '能量磁场分析',
    desc: '手机号码能量解读，数字磁场组合分析与评分。',
  },
  // {
  //   icon: Shield,
  //   title: '合盘分析',
  //   desc: '双人命盘对比，关系能量配对，深度缘分解析。',
  // },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PreLoginNav />

      {/* Hero */}
      <section className="relative pt-16 min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="w-auto">
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--qimen-gold))]" />
              智能玄学平台
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 flex flex-col gap-1">
              <span>一站式</span>
              <span className="py-2 text-[hsl(var(--qimen-gold))]">AI玄学</span>
              <span>咨询平台</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              融合奇门遁甲、八字命理、数字能量等多维度分析工具，
              搭载AI智能解读引擎，让玄学咨询更高效、更精准。
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">
              核心功能
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              为什么选择全球发愿
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              集成多种专业分析工具，一个平台满足所有玄学咨询需求。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-[hsl(var(--qimen-gold)/0.4)] transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--qimen-gold)/0.15)] flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-[hsl(var(--qimen-gold))]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">
              使用流程
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              四步开启智能咨询
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              简单几步，即可体验AI驱动的玄学分析服务。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: '注册账号', desc: '填写简单信息，快速创建您的专属账号。', color: 'text-primary' },
              { num: '02', title: '添加客户', desc: '录入客户的出生信息，系统自动生成命盘。', color: 'text-[hsl(var(--qimen-gold))]' },
              { num: '03', title: 'AI分析', desc: '选择分析主题，AI引擎即时生成专业解读报告。', color: 'text-destructive' },
              { num: '04', title: '管理咨询', desc: '保存历史记录，随时回顾和跟踪咨询内容。', color: 'text-green-600' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <span className={`text-5xl md:text-6xl font-bold ${step.color} opacity-30`}>{step.num}</span>
                <h3 className="text-lg font-semibold mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
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
              <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">
                我们的使命
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight flex flex-col gap-1">
                <span>让玄学智慧</span>
                <span>触手可及</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                我们深知传统玄学咨询面临的种种挑战——复杂的排盘计算、海量的知识记忆、难以标准化的解读过程。
                这些都让优质的玄学服务难以规模化。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                因此，我们的使命是打造一个集成AI智能解读的一站式玄学平台，让每一位咨询师都能高效、精准地为客户提供服务，
                让古老的智慧借助现代科技焕发新的生命力。
              </p>
            </div>
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--qimen-gold))] mb-3">
                我们的愿景
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight flex flex-col gap-1">
                <span>AI赋能</span>
                <span>传统智慧</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                我们相信，人工智能与传统玄学的结合将开创一个全新的时代。通过深度学习和知识图谱技术，
                AI可以辅助咨询师更快速地洞察命理信息，提供更全面的分析视角。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                我们的愿景是成为全球华人社区最值得信赖的AI玄学平台，
                让每一次咨询都充满洞见与价值。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              用户的声音
            </h2>
            <p className="text-muted-foreground max-w-lg">
              来自真实用户的使用反馈与体验分享。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: '李老师',
                role: '命理咨询师',
                quote: '以前排一个奇门盘要花很长时间核对，现在用艾薇AI几秒钟就完成了，而且AI的解读角度经常给我新的启发，大大提升了咨询效率。',
              },
              {
                name: '张女士',
                role: '企业顾问',
                quote: '客户管理功能太方便了！每个客户的命盘和咨询记录都一目了然，再也不用翻纸质笔记本了。合盘分析功能对我做企业合伙人匹配非常有帮助。',
              },
              {
                name: '王先生',
                role: '风水师',
                quote: '数字能量分析和奇门排盘的结合使用，让我的服务范围扩大了不少。平台操作简洁，手机上随时可以给客户做快速分析，非常专业。',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col"
              >
                <div className="flex-1">
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                </div>
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
      </section> */}

      <PreLoginFooter />
    </div>
  );
}
