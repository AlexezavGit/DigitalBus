import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreResult {
  beneficiaryId: string;
  scores: {
    diagnosisSeverity: number;
    treatmentReadiness: number;
    socialSupport: number;
    financialNeed: number;
    programHistory: number;
  };
  totalScore: number;
  recommendation: "high_priority" | "medium_priority" | "low_priority";
  estimatedSessions: number;
  expectedDuration: string;
  successProbability: number;
}

export default function ScoringDashboard() {
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch scoring data for demo beneficiary
  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scoring/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beneficiaryId: "BEN-2024-001",
          programType: "intensive",
          diagnosisLevel: "medium",
          treatmentHistory: {
            completionRate: 0.85,
            previousPrograms: 1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API unavailable (${response.status})`);
      }

      const data = await response.json();
      setScores(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`API unavailable, using mock data (${message})`);

      const fallback: ScoreResult = {
        beneficiaryId: "BEN-2024-001",
        scores: {
          diagnosisSeverity: 21,
          treatmentReadiness: 18,
          socialSupport: 13,
          financialNeed: 19,
          programHistory: 15,
        },
        totalScore: 86,
        recommendation: "high_priority",
        estimatedSessions: 16,
        expectedDuration: "4 months",
        successProbability: 90,
      };

      setScores(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "high_priority":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium_priority":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low_priority":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-indigo-600" />
            Co-funding Evaluation Score
          </CardTitle>
          <Button 
            onClick={fetchScore} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? "Loading..." : "Recalculate Score"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {scores && !loading && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(scores.totalScore)}`}>
                  {scores.totalScore}
                </p>
                <div className="mt-3 w-full">
                  <Progress value={scores.totalScore} className="h-2" />
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Success Probability</p>
                <p className="text-3xl font-bold text-purple-600">
                  {scores.successProbability.toFixed(0)}%
                </p>
                <Badge className="mt-3 bg-purple-100 text-purple-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  High Confidence
                </Badge>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Recommendation</p>
                <Badge className={`block mt-2 border ${getRecommendationColor(scores.recommendation)} justify-center py-2`}>
                  {scores.recommendation === "high_priority" && "🔴 High Priority"}
                  {scores.recommendation === "medium_priority" && "🟡 Medium Priority"}
                  {scores.recommendation === "low_priority" && "🟢 Low Priority"}
                </Badge>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores.scores).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium capitalize text-gray-700">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <span className="text-lg font-bold text-indigo-600">{value}</span>
                  </div>
                  <Progress value={(value / 25) * 100} className="h-2" />
                </div>
              ))}
            </div>

            {/* Program Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Estimated Sessions</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {scores.estimatedSessions}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Expected Duration</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {scores.expectedDuration}
                </p>
              </div>
            </div>

            {/* Implementation Info */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-indigo-700">
                <strong>💡 Next Steps:</strong> Based on this evaluation, we recommend{" "}
                {scores.recommendation === "high_priority" 
                  ? "prioritizing this beneficiary for immediate program enrollment with full co-funding support."
                  : scores.recommendation === "medium_priority"
                  ? "scheduling a follow-up assessment within 2 weeks to confirm enrollment readiness."
                  : "placing this beneficiary on waiting list and re-evaluating in 30 days."}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-gray-600">Calculating score...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
