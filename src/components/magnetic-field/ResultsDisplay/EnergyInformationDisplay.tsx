import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, AlertTriangle, Tag } from 'lucide-react';
import { Language, Combination } from '@/types/index';

interface EnergyInfo {
  id: string;
  name: {
    zh: string;
    en: string;
    ms: string;
  };
  abbreviation: string;
  characteristics: {
    zh: string;
    en: string;
    ms: string;
  };
  weaknesses: {
    zh: string;
    en: string;
    ms: string;
  };
  tags: {
    zh: string[];
    en: string[];
    ms: string[];
  };
}

interface EnergyInformationDisplayProps {
  currentLanguage: Language;
  combinations?: Combination[];
}

const energyData: EnergyInfo[] = [
  {
    id: 'tianyi',
    name: {
      zh: '天医',
      en: 'Tian Yi (TY)',
      ms: 'Tian Yi (TY)'
    },
    abbreviation: 'TY',
    characteristics: {
      zh: '天性聪慧，心地善良，善解人意，乐于助人，真诚待人，心胸开阔，能成大事，象征天上的医神，守护神，财富的象征，好婚姻，好运势。具备开发智慧和学习能力，财运和事业运佳。',
      en: 'Naturally intelligent, kind-hearted, understanding, enjoys helping others, sincere, open-minded, capable of great achievements, symbolizes the heavenly god of medicine, guardian, symbol of wealth, good marriage, and good fortune. Has the ability to develop wisdom and learning capacity, good financial and career fortune.',
      ms: 'Bijak secara semula jadi, baik hati, memahami, suka menolong orang lain, ikhlas, berfikiran terbuka, mampu mencapai kejayaan besar, melambangkan dewa perubatan syurga, penjaga, simbol kekayaan, perkahwinan yang baik, dan nasib baik. Mempunyai keupayaan untuk mengembangkan kebijaksanaan dan kapasiti pembelajaran, nasib kewangan dan kerjaya yang baik.'
    },
    weaknesses: {
      zh: '由于过分的善良和开明，容易被人欺骗',
      en: 'Due to extreme kindness and open-mindedness, easily deceived',
      ms: 'Disebabkan terlalu baik dan berfikiran terbuka, mudah ditipu'
    },
    tags: {
      zh: ['财富', '好姻缘', '血压', '智慧', '中医'],
      en: ['Finance', 'Good Romance', 'Blood Pressure', 'Intelligence', 'Traditional Chinese Medicine'],
      ms: ['Kewangan', 'Percintaan Baik', 'Tekanan Darah', 'Kecerdasan', 'Perubatan Cina Tradisional']
    }
  },
  {
    id: 'yannian',
    name: {
      zh: '延年',
      en: 'Yan Nian (YN)',
      ms: 'Yan Nian (YN)'
    },
    abbreviation: 'YN',
    characteristics: {
      zh: '具有领导能力，负责任，勇于承担，经常成为领导者，心胸宽广，心地善良，有同情心，有正义感，喜欢为弱者辩护，通常长寿。',
      en: 'Has leadership abilities, responsible, brave in bearing burdens, often becomes a leader, broad-minded, kind-hearted, sympathetic, has a sense of justice, likes to defend the weak, and usually long-lived.',
      ms: 'Mempunyai kebolehan kepimpinan, bertanggungjawab, berani menanggung beban, sering menjadi pemimpin, berfikiran luas, baik hati, bersimpati, mempunyai rasa keadilan, suka mempertahankan yang lemah, dan biasanya berumur panjang.'
    },
    weaknesses: {
      zh: '延年过多，工作会变得很累。女性数字19、87多为女强人，严厉，霸道，要求高，容易挑剔，压制丈夫运势，高标准使得难以找到合适伴侣。',
      en: 'With many Yan Nian, work becomes very tiring. Women with numbers 19, 87 are mostly powerful women, stern, domineering, with high expectations, easily critical, suppress their husband\'s fortune, and their high standards make it difficult to find suitable partners.',
      ms: 'Dengan banyak Yan Nian, kerja menjadi sangat memenatkan. Wanita dengan angka 19, 87 kebanyakannya adalah wanita berkuasa, tegas, dominan, dengan jangkaan tinggi, mudah mengkritik, menekan nasib suami, dan standard tinggi mereka menyukarkan untuk mencari pasangan yang sesuai.'
    },
    tags: {
      zh: ['储蓄', '理财', '健康', '专业', '工作', '有影响力的男性', '精神压力'],
      en: ['Saving Money', 'Financial Management', 'Health', 'Professional', 'Work', 'Influential Men', 'Mental Pressure'],
      ms: ['Menyimpan Wang', 'Pengurusan Kewangan', 'Kesihatan', 'Profesional', 'Kerja', 'Lelaki Berpengaruh', 'Tekanan Mental']
    }
  },
  {
    id: 'shengqi',
    name: {
      zh: '生气',
      en: 'Sheng Qi (SQ)',
      ms: 'Sheng Qi (SQ)'
    },
    abbreviation: 'SQ',
    characteristics: {
      zh: '快乐，乐观，轻松，心胸宽广，开朗，精力充沛，充满活力，不太重视感情，大方，不计较小事，情商高，好人缘多，社交关系好，天性开朗，能接受任何事物，到处都是笑容，友善，平易近人，给他人带来快乐，形成和谐甜蜜的关系，能交很多好朋友。',
      en: 'Happy, optimistic, relaxed, broad-minded, cheerful, energetic, full of vigor, doesn\'t take feelings too seriously, generous, doesn\'t fuss over small matters, high emotional intelligence, many good acquaintances, good social relationships, naturally cheerful, can accept anything, always smiling everywhere, friendly, approachable, brings joy to others, and forms harmonious and sweet relationships, can make many good friends.',
      ms: 'Gembira, optimis, santai, berfikiran luas, ceria, bertenaga, penuh semangat, tidak terlalu mengambil berat tentang perasaan, pemurah, tidak mempertikaikan perkara kecil, kecerdasan emosi tinggi, ramai kenalan baik, hubungan sosial yang baik, ceria secara semula jadi, boleh menerima apa-apa sahaja, sentiasa tersenyum di mana-mana, mesra, mudah didekati, membawa kegembiraan kepada orang lain, dan membentuk hubungan yang harmoni dan manis, boleh berkawan dengan ramai orang baik.'
    },
    weaknesses: {
      zh: '对任何事情都不太苛求，野心较少，生气磁场过强会导致懒惰，缺乏个人主见，容易满足现状，抱着随遇而安的态度。',
      en: 'Not too demanding of anything, less ambitious, too strong a Sheng Qi field can cause laziness, lack of personal opinion, easily satisfied with the current situation, and takes an anything-goes attitude.',
      ms: 'Tidak terlalu menuntut apa-apa, kurang bercita-cita tinggi, medan Sheng Qi yang terlalu kuat boleh menyebabkan kemalasan, kurang pendapat peribadi, mudah berpuas hati dengan keadaan semasa, dan mengambil sikap apa-apa sahaja boleh.'
    },
    tags: {
      zh: ['贵人', '服务业', '随遇而安', '胃病'],
      en: ['Important People', 'Service Industry', 'Go with the Flow', 'Stomach Problems'],
      ms: ['Orang Penting', 'Industri Perkhidmatan', 'Ikut Keadaan', 'Masalah Perut']
    }
  },
  {
    id: 'fuwei',
    name: {
      zh: '伏位',
      en: 'Fu Wei (FW)',
      ms: 'Fu Wei (FW)'
    },
    abbreviation: 'FW',
    characteristics: {
      zh: '能够拥有超乎常人的耐心和毅力，能够获得和抓住机会真正发现自己。虽然安静，但有很大的潜力让每个人都对成功感到惊讶。',
      en: 'Able to possess extraordinary patience and perseverance, and can get and take advantage of opportunities to truly discover oneself. Although quiet, has great potential to surprise everyone with success.',
      ms: 'mampu memiliki kesabaran dan ketekunan yang luar biasa, dan boleh mendapat serta memanfaatkan peluang untuk benar-benar menemui diri sendiri. Walaupun pendiam, mempunyai potensi besar untuk mengejutkan semua orang dengan kejayaan.'
    },
    weaknesses: {
      zh: '等待时间过长，错失良机，不敢冒险，犹豫不决',
      en: 'Waiting too long, missing good opportunities, not daring to take risks, hesitant',
      ms: 'Menunggu terlalu lama, terlepas peluang baik, tidak berani mengambil risiko, ragu-ragu'
    },
    tags: {
      zh: ['固执', '保守', '心脏病', '被动'],
      en: ['Stubborn', 'Conservative', 'Heart Disease', 'Passive'],
      ms: ['Degil', 'Konservatif', 'Penyakit Jantung', 'Pasif']
    }
  },
  {
    id: 'jueming',
    name: {
      zh: '绝命',
      en: 'Jue Ming (JM)',
      ms: 'Jue Ming (JM)'
    },
    abbreviation: 'JM',
    characteristics: {
      zh: '思维敏捷，记忆力强，很会赚钱，目标明确，野心很大，计划能力出色，判断力敏锐，心地善良，公正，勇敢，愿意冒险，能获得意外利润。财务、股票、基金、房地产都依赖绝命数字，具有强烈的判断力和毅力，反应迅速，敏感，有不服输的精神，非常适合需要记忆和思考的事务。',
      en: 'Quick thinking, strong memory, very good at making money, clear goals, highly ambitious, excellent planning abilities, sharp judgment, kind-hearted, fair, brave, willing to take risks, can gain unexpected profits. Finance, stocks, funds, real estate depend on Jue Ming numbers, has strong judgment and perseverance, quick reactions, sensitive, has a spirit of not wanting to lose, very suitable for matters requiring memory and thinking.',
      ms: 'Pemikiran pantas, ingatan kuat, sangat pandai membuat wang, matlamat jelas, bercita-cita tinggi, kebolehan merancang yang cemerlang, pertimbangan tajam, baik hati, adil, berani, sanggup mengambil risiko, boleh memperoleh keuntungan yang tidak dijangka. Kewangan, saham, dana, hartanah bergantung pada nombor Jue Ming, mempunyai pertimbangan dan ketekunan yang kuat, reaksi pantas, sensitif, mempunyai semangat tidak mahu kalah, sangat sesuai untuk perkara yang memerlukan ingatan dan pemikiran.'
    },
    weaknesses: {
      zh: '脾气暴躁，情绪不稳定，容易惹上法律纠纷，容易得罪人，容易受影响，直率容易相信人，爱憎分明，喜欢反叛，过于自信，浪费，喜欢赌博，不善于储蓄',
      en: 'Hot-tempered, emotionally unstable, easily gets into legal troubles, easily offends others, easily influenced, straightforward and trusts people easily, clear about love and hate, likes to rebel, too confident in oneself, wasteful, likes gambling, not good at saving money',
      ms: 'Pemarah, tidak stabil emosi, mudah terlibat dalam masalah undang-undang, mudah menyinggung perasaan orang lain, mudah dipengaruhi, terus terang dan mudah mempercayai orang, jelas tentang cinta dan benci, suka memberontak, terlalu yakin diri, membazir, suka berjudi, tidak pandai menyimpan wang'
    },
    tags: {
      zh: ['诉讼', '破财', '肾脏', '糖尿病', '妇科问题', '冲动', '冒险', '赌博', '不服输', '叛逆', '心软', '重感情'],
      en: ['Lawsuits', 'Financial Loss', 'Kidneys', 'Diabetes', 'Gynecological Issues', 'Impulsiveness', 'Risk-Taking', 'Gambling', 'Unwilling to Lose', 'Rebellious', 'Soft-hearted', 'Values Relationships'],
      ms: ['Tuntutan Mahkamah', 'Kerugian Kewangan', 'Buah Pinggang', 'Kencing Manis', 'Masalah Ginekologi', 'Impulsif', 'Mengambil Risiko', 'Perjudian', 'Tidak Mahu Kalah', 'Pemberontak', 'Lembut Hati', 'Menghargai Hubungan']
    }
  },
  {
    id: 'wugui',
    name: {
      zh: '五鬼',
      en: 'Wu Gui (5G)',
      ms: 'Wu Gui (5G)'
    },
    abbreviation: '5G',
    characteristics: {
      zh: '有才华，聪明，想法多，充满创意想法，友善，善于外交，对所有人都好，敏感，学习能力强，多领域有才华，经常在重要时刻表现出人意料，不断寻求创新和变化，精于策略和计划，做事出人意料，具有双重性格，正义与狡猾。',
      en: 'Talented, intelligent, has many ideas, full of creative ideas, friendly, diplomatic, good to everyone, sensitive, strong learning ability, talented in many fields, often acts unexpectedly at important moments, continuously seeks innovation and change, skilled in strategy and planning, does things surprisingly, has dual personality, justice and cunning.',
      ms: 'Berbakat, bijak, mempunyai banyak idea, penuh idea kreatif, mesra, diplomatik, baik kepada semua orang, sensitif, keupayaan pembelajaran yang kuat, berbakat dalam banyak bidang, sering bertindak secara tidak dijangka pada saat-saat penting, terus mencari inovasi dan perubahan, mahir dalam strategi dan perancangan, melakukan perkara secara mengejutkan, mempunyai personaliti berkembar, keadilan dan licik.'
    },
    weaknesses: {
      zh: '喜欢幻想，非常多疑，缺乏安全感，具有不稳定的特征，反复无常，难以沟通，常人难以理解',
      en: 'Likes to fantasize, very suspicious, lacks sense of security, has unstable characteristics, inconsistent, difficult to communicate with, difficult for ordinary people to understand',
      ms: 'Suka berkhayal, sangat syak wasangka, kurang rasa selamat, mempunyai ciri tidak stabil, tidak konsisten, sukar berkomunikasi, sukar difahami oleh orang biasa'
    },
    tags: {
      zh: ['变化', '心脏病', '外国', '多疑', '宗教与艺术', '电脑', '意外', '财务', '美容', '中西医'],
      en: ['Change', 'Heart Disease', 'Foreign Countries', 'Suspicion', 'Religion and Art', 'Computers', 'Accidents', 'Finance', 'Beauty', 'Eastern and Western Medicine'],
      ms: ['Perubahan', 'Penyakit Jantung', 'Negara Asing', 'Syak Wasangka', 'Agama dan Seni', 'Komputer', 'Kemalangan', 'Kewangan', 'Kecantikan', 'Perubatan Timur dan Barat']
    }
  },
  {
    id: 'liusha',
    name: {
      zh: '六煞',
      en: 'Liu Sha (LS)',
      ms: 'Liu Sha (LS)'
    },
    abbreviation: 'LS',
    characteristics: {
      zh: '聪明适应性强，社交能力强，思维细腻，情感丰富，沟通能力好，喜欢美的事物，对艺术有独特的鉴赏能力，爱美，喜欢打扮，充满魅力，很受异性欢迎。初次见面时，充满温暖，对他人非常关心，总是给他人留下很好的印象。',
      en: 'Clever and adaptable, strong social skills, delicate thinking, rich emotions, good communication skills, likes beautiful things, has a unique ability to appreciate art, loves beauty, likes to dress up, full of charm, very popular with the opposite sex. At first meetings, full of warmth, very attentive to others, always leaves a very good impression on others.',
      ms: 'Bijak dan mudah menyesuaikan diri, kemahiran sosial yang kuat, pemikiran halus, emosi yang kaya, kemahiran komunikasi yang baik, suka perkara indah, mempunyai keupayaan unik untuk menghargai seni, suka kecantikan, suka berdandan, penuh pesona, sangat popular dengan lawan jenis. Pada pertemuan pertama, penuh kehangatan, sangat prihatin terhadap orang lain, sentiasa meninggalkan kesan yang sangat baik kepada orang lain.'
    },
    weaknesses: {
      zh: '敏感易感动，被情感困扰导致情绪不稳定，优柔寡断，在感情方面容易改变方向，为女性花钱',
      en: 'Sensitive and easily touched, troubled by emotions causing emotional instability, indecisive, easily changes direction in relationships, spends money on women',
      ms: 'Sensitif dan mudah tersentuh, bermasalah dengan emosi menyebabkan ketidakstabilan emosi, tidak dapat membuat keputusan, mudah berubah arah dalam hubungan, membelanjakan wang untuk wanita'
    },
    tags: {
      zh: ['不合适的爱情', '女性', '家庭', '胃', '皮肤', '服务业', '抑郁', '癌症', '优柔寡断', '美容'],
      en: ['Unsuitable Love', 'Women', 'Home', 'Stomach', 'Skin', 'Service Industry', 'Depression', 'Cancer', 'Indecisive', 'Beauty'],
      ms: ['Cinta Yang Tidak Sesuai', 'Wanita', 'Rumah', 'Perut', 'Kulit', 'Industri Perkhidmatan', 'Kemurungan', 'Kanser', 'Tidak Dapat Membuat Keputusan', 'Kecantikan']
    }
  },
  {
    id: 'huohai',
    name: {
      zh: '祸害',
      en: 'Huo Hai (HH)',
      ms: 'Huo Hai (HH)'
    },
    abbreviation: 'HH',
    characteristics: {
      zh: '善于交谈，交际聪明，说话流利，善于辩论，靠嘴吃饭，享受美食，说话技巧带来财富。靠嘴吃饭，适合销售等工作。',
      en: 'Good at talking, clever in interactions, fluent in speaking, good at debating, makes a living using the mouth, enjoys delicious food, speaking skills bring wealth. Makes a living using the mouth, suitable for sales and so on.',
      ms: 'Pandai bercakap, bijak dalam interaksi, fasih bercakap, pandai berdebat, mencari nafkah menggunakan mulut, menikmati makanan sedap, kemahiran bercakap membawa kekayaan. Mencari nafkah menggunakan mulut, sesuai untuk jualan dan sebagainya.'
    },
    weaknesses: {
      zh: '口舌之争多，善于花言巧语，喜欢炫耀，固执，喜欢抱怨，喜欢计较小事，容易激怒他人',
      en: 'Many verbal disputes, good at using sweet words, likes to show off, stubborn, likes to complain, likes to count small matters, easily provokes anger in others',
      ms: 'Banyak perselisihan lisan, pandai menggunakan kata-kata manis, suka menunjuk-nunjuk, degil, suka mengadu, suka mengira perkara kecil, mudah memprovokasi kemarahan orang lain'
    },
    tags: {
      zh: ['意外', '招惹坏人', '靠嘴吃饭', '呼吸道疾病', '说话直接', '心理准备但不口头'],
      en: ['Accidents', 'Attracts Bad People', 'Makes a Living by Talking', 'Respiratory Diseases', 'Speaks Directly', 'Mentally Prepared but Not Verbally'],
      ms: ['Kemalangan', 'Menarik Orang Jahat', 'Mencari Nafkah dengan Bercakap', 'Penyakit Pernafasan', 'Bercakap Secara Langsung', 'Bersedia Mental tetapi Tidak Secara Lisan']
    }
  }
];

export function EnergyInformationDisplay({ currentLanguage, combinations }: EnergyInformationDisplayProps) {
  const filteredEnergyData = useMemo(() => {
    if (!combinations || combinations.length === 0) return energyData;
    // Extract unique star base names from combinations (e.g. "天医" from "天医1")
    const starNames = new Set(
      combinations.map(c => c.name.replace(/^(隐藏|加强|混合)/, '').replace(/[1-4]$/, ''))
    );
    return energyData.filter(energy => {
      const baseName = energy.name.zh.replace(/\s*\(.*\)$/, ''); // "天医 (TY)" -> "天医"
      return starNames.has(baseName);
    });
  }, [combinations]);

  if (filteredEnergyData.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2 text-primary">
          {currentLanguage === 'zh' ? '能量信息' : 
           currentLanguage === 'en' ? 'Energy Information' : 
           'Maklumat Tenaga'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentLanguage === 'zh' ? '了解各种星象能量的特征和含义' : 
           currentLanguage === 'en' ? 'Understand the characteristics and meanings of various star energies' : 
           'Memahami ciri dan makna pelbagai tenaga bintang'}
        </p>
      </div>

      {filteredEnergyData.map((energy) => (
        <div key={energy.id} className="bg-card rounded-lg border border-border">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {energy.name[currentLanguage]}
              </span>
              {/* <Badge variant="outline" className="border-primary/30 text-primary">
                {energy.abbreviation}
              </Badge> */}
            </div>
          </div>
          <div className="px-4 pb-4 space-y-4">
            {/* Characteristics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-primary text-sm">
                  {currentLanguage === 'zh' ? '特征' : 
                   currentLanguage === 'en' ? 'Characteristics' : 
                   'Ciri-ciri'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {energy.characteristics[currentLanguage]}
              </p>
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-red-500 text-sm">
                  {currentLanguage === 'zh' ? '弱点' : 
                   currentLanguage === 'en' ? 'Weaknesses' : 
                   'Kelemahan'}
                </span>
              </div>
              <div className="bg-red-500/10 p-3 rounded-lg ml-6">
                <p className="text-sm text-red-600 leading-relaxed">
                  {energy.weaknesses[currentLanguage]}
                </p>
              </div>
            </div>

            {/* Related Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground text-sm">
                  {currentLanguage === 'zh' ? '相关标签' : 
                   currentLanguage === 'en' ? 'Related Tags' : 
                   'Tag Berkaitan'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {energy.tags[currentLanguage].map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}