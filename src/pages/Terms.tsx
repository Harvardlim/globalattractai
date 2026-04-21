import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import PreLoginFooter from '@/components/PreLoginFooter';

export default function Terms() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/images/global-attract-logo-black.png" alt="Logo" className="h-8" />
            <span className="font-bold text-lg">全球发愿</span>
            {/* <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/wuxing'); }}>五行营销</Button> */}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(user ? '/dashboard' : '/')}>{user ? '去Dashboard' : '登录'}</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">条款与条件</h1>
          <p className="text-sm text-muted-foreground mb-8">最后更新日期：2026年2月20日</p>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. 服务概述</h2>
              <p>全球发愿（以下简称"本平台"）由 Global Attract 全球发愿 运营，为用户提供基于AI技术的玄学分析和咨询服务，包括但不限于奇门遁甲排盘、八字命理分析、数字能量分析和五行营销咨询等。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. 用户协议</h2>
              <p>使用本平台即表示您同意遵守以下条款。如果您不同意这些条款，请勿使用本平台的服务。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>用户须年满18周岁方可注册使用。</li>
                <li>用户应提供真实、准确的个人信息。</li>
                <li>用户对其账户的所有活动负责。</li>
                <li>禁止将本平台用于任何非法或未经授权的目的。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. 服务免责声明</h2>
              <p>本平台提供的所有分析和建议仅供参考，不构成任何专业建议（包括但不限于医疗、法律、投资建议）。用户应根据自身情况做出独立判断和决策。本平台对因使用分析结果而导致的任何直接或间接损失不承担责任。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. 知识产权</h2>
              <p>本平台上的所有内容，包括但不限于文本、图形、徽标、图标、软件和音频，均为 Global Attract 或其内容提供商的财产，受国际版权法保护。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. 隐私保护</h2>
              <p>我们重视用户的隐私保护。我们将按照适用法律法规收集、使用和保护您的个人信息。详情请参阅我们的隐私政策。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>我们收集的信息仅用于提供和改善服务。</li>
                <li>未经您的同意，我们不会将您的个人信息分享给第三方。</li>
                <li>我们采取适当的安全措施保护您的数据。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. 付费服务</h2>
              <p>本平台部分功能可能需要付费使用。所有费用将在购买前明确告知。除非法律另有规定，已支付的费用概不退还。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. 条款修改</h2>
              <p>本平台保留随时修改本条款的权利。修改后的条款将在本页面发布后立即生效。继续使用本平台即表示您接受修改后的条款。</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. 联系方式</h2>
              <p>如对本条款有任何疑问，请通过以下方式联系我们：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>电话：+60 143686319</li>
                <li>地址：Kuala Lumpur, Malaysia</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  );
}
