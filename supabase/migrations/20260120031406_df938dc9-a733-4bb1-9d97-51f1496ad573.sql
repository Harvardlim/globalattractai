-- Create chat_conversations table for storing chat sessions
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (no auth for now)
CREATE POLICY "Allow all access to chat_conversations"
ON public.chat_conversations
FOR ALL
USING (true)
WITH CHECK (true);

-- Create chat_messages table for storing messages in each conversation
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  mentioned_client_ids UUID[] DEFAULT '{}',
  mentioned_consultation_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (no auth for now)
CREATE POLICY "Allow all access to chat_messages"
ON public.chat_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updating updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add title column to realtime_consultations for better @事项 display
ALTER TABLE public.realtime_consultations ADD COLUMN IF NOT EXISTS title TEXT;