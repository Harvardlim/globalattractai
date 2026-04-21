import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ExternalLink, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { getComponentT } from "@/data/destinyTranslations";

const GOOGLE_FORM_URL = "https://forms.gle/vLTpZwmuvPe6oFTj8"; // TODO: Replace with actual Google Form URL

interface ChartFeedbackSectionProps {
  chartType?: string;
}

export default function ChartFeedbackSection({ chartType = "命盘" }: ChartFeedbackSectionProps) {
  const { currentLanguage } = useLanguage();
  const ct = getComponentT(currentLanguage);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [featureRequest, setFeatureRequest] = useState("");

  const handleSubmitToForm = () => {
    // Build Google Form URL with pre-filled params (adjust entry IDs to match your form)
    const params = new URLSearchParams();
    if (rating > 0) params.set("entry.rating", String(rating));
    if (feedback.trim()) params.set("entry.feedback", feedback.trim());
    if (featureRequest.trim()) params.set("entry.feature", featureRequest.trim());
    
    const url = params.toString() 
      ? `${GOOGLE_FORM_URL}?${params.toString()}`
      : GOOGLE_FORM_URL;
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          {ct.feedbackTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{ct.feedbackDesc}</p>
        {/* Rating */}
        {/* <div className="space-y-2">
          <Label className="text-sm">为这个{chartType}评分</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-0.5 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground ml-2 self-center">
                {rating}/5
              </span>
            )}
          </div>
        </div> */}

        {/* Feedback */}
        {/* <div className="space-y-2">
          <Label htmlFor="feedback" className="text-sm">您的反馈</Label>
          <Textarea
            id="feedback"
            placeholder="告诉我们您对这个功能的看法..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[60px] text-sm"
            maxLength={500}
          />
        </div> */}

        {/* Feature Request */}
        {/* <div className="space-y-2">
          <Label htmlFor="feature" className="text-sm">想要的功能</Label>
          <Textarea
            id="feature"
            placeholder="您希望我们添加什么功能？"
            value={featureRequest}
            onChange={(e) => setFeatureRequest(e.target.value)}
            className="min-h-[60px] text-sm"
            maxLength={500}
          />
        </div> */}

        {/* Submit Button */}
        <Button onClick={handleSubmitToForm} className="w-full gap-2">
          <ExternalLink className="h-4 w-4" />
          {ct.submitFeedback}
        </Button>
      </CardContent>
    </Card>
  );
}
