import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisResultsProps {
  detected: boolean;
  confidence: number;
}

export const AnalysisResults = ({ detected, confidence }: AnalysisResultsProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${detected ? "bg-warning/10" : "bg-success/10"}`}>
            {detected ? (
              <AlertCircle className="w-8 h-8 text-warning" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-success" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-semibold">
              {detected ? "Cancer Cells Detected" : "No Cancer Detected"}
            </h3>
            <p className="text-muted-foreground">
              {detected
                ? "The analysis has identified potential cancer cells in the provided image. Please consult with a medical professional for confirmation and next steps."
                : "The analysis did not detect cancer cells in the provided image. This result should be verified by a qualified medical professional."}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Confidence Score</span>
            <span className="text-sm font-semibold">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
          <p className="text-xs text-muted-foreground">
            This score represents the AI model's confidence in its prediction
          </p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground italic">
            ⚕️ This analysis is for informational purposes only and should not replace professional medical diagnosis. Always consult with qualified healthcare providers for medical decisions.
          </p>
        </div>
      </div>
    </Card>
  );
};
