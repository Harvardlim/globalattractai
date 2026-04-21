import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Heart, Briefcase, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { luckyStars, unluckyStars, EnergyStarInfo } from "@/data/energyEncyclopediaData";
import { StarLevelTable } from "@/components/magnetic-field/StarLevelTable";

interface StarCardProps {
  star: EnergyStarInfo;
}

const StarCard: React.FC<StarCardProps> = ({ star }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50">
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                  star.type === 'lucky' 
                    ? "bg-green-500/20 text-green-600" 
                    : "bg-rose-500/20 text-rose-600"
                )}>
                  {star.abbreviation}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{star.name}</h3>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      star.type === 'lucky' 
                        ? "border-green-500/30 text-green-600" 
                        : "border-rose-500/30 text-rose-600"
                    )}>
                      {star.theme}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {star.combinations.join(', ')}
                  </p>
                </div>
              </div>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Personality Section */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium">
                <User className="h-4 w-4" />
                <span>性格特征</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {star.personality.traits.map((trait, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-green-600">✓ 优势</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {star.personality.strengths.map((s, i) => (
                      <li key={i} className="list-disc">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-amber-600">! 提醒</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {star.personality.weaknesses.map((w, i) => (
                      <li key={i} className="list-disc">{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm">
                  <span className="font-medium">沟通风格：</span>
                  <span className="text-muted-foreground">{star.personality.communication}</span>
                </div>
              </div>
            </div>

            {/* Health Section */}
            <div className="bg-rose-500/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-medium">
                <Heart className="h-4 w-4" />
                <span>健康提示</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">关注部位：</span>
                  <span className="text-sm text-muted-foreground">
                    {star.health.bodyParts.join('、')}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">健康风险：</span>
                  <span className="text-sm text-muted-foreground">
                    {star.health.risks.join('、')}
                  </span>
                </div>
                <div className="text-sm bg-background/50 rounded p-2">
                  <span className="font-medium">建议：</span>
                  <span className="text-muted-foreground">{star.health.advice}</span>
                </div>
              </div>
            </div>

            {/* Life Path Section */}
            <div className="bg-blue-500/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Briefcase className="h-4 w-4" />
                <span>人生轨道</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">适合职业：</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {star.lifePath.career.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-blue-500/30 text-blue-600">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">感情特点：</span>
                  <span className="text-muted-foreground">{star.lifePath.relationships}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">发展方向：</span>
                  <span className="text-muted-foreground">{star.lifePath.direction}</span>
                </div>
                <div className="text-sm bg-background/50 rounded p-2">
                  <span className="font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    命理建议：
                  </span>
                  <span className="text-muted-foreground">{star.lifePath.advice}</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const EnergyEncyclopedia: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-lg">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold flex-1">数字能量宝典</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        <Tabs defaultValue="levels" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="levels" className="flex-1 gap-1">
              等级表
            </TabsTrigger>
            <TabsTrigger value="lucky" className="flex-1 gap-1">
              <span className="text-green-600">★</span> 吉星
            </TabsTrigger>
            <TabsTrigger value="unlucky" className="flex-1 gap-1">
              <span className="text-rose-600">★</span> 凶星
            </TabsTrigger>
          </TabsList>

          <TabsContent value="levels" className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              八星数字组合等级对照表
            </p>
            <StarLevelTable />
          </TabsContent>

          <TabsContent value="lucky" className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              四吉星代表积极正面的能量，带来好运与机遇
            </p>
            {luckyStars.map((star) => (
              <StarCard key={star.id} star={star} />
            ))}
          </TabsContent>

          <TabsContent value="unlucky" className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              四凶星需要注意化解，了解其特点可趋吉避凶
            </p>
            {unluckyStars.map((star) => (
              <StarCard key={star.id} star={star} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnergyEncyclopedia;
