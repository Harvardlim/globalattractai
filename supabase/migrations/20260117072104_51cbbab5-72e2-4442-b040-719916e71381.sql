-- 创建客户表
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_hour INTEGER NOT NULL CHECK (birth_hour >= 0 AND birth_hour <= 11),
  gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建咨询记录表
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('事实盘', '命理盘')),
  chart_date TIMESTAMP WITH TIME ZONE NOT NULL,
  chart_data JSONB NOT NULL,
  topic TEXT CHECK (topic IN ('健康', '财富', '关系', '轨道', '综合')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建AI解读记录表（知识库）
CREATE TABLE public.interpretations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 为clients表添加触发器
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 暂时禁用RLS以便测试（用户说暂时不需要登录）
-- 后续添加认证时启用RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;

-- 临时公开访问策略（测试阶段）
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to interpretations" ON public.interpretations FOR ALL USING (true) WITH CHECK (true);