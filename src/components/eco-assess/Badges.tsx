
"use client";

import { Badge } from "@/components/ui/badge";
import type { IngredientDetail } from "@/ai/schemas/product-analysis-schemas";

export const ImpactLevelBadge = ({ level }: { level: "low" | "medium" | "high" | "unknown" | undefined}) => {
  if (!level) return <Badge variant="outline" className="capitalize bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500">N/A</Badge>;
  const variantMap = {
    low: "default",
    medium: "secondary",
    high: "destructive",
    unknown: "outline",
  } as const;
  const colorMap = {
    low: "bg-green-100 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600",
    high: "bg-red-100 text-red-700 border-red-300 dark:bg-red-800 dark:text-red-200 dark:border-red-600",
    unknown: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500",
  }
  return <Badge variant={variantMap[level]} className={`${colorMap[level]} capitalize`}>{level}</Badge>;
}

export const IngredientAssessmentBadge = ({ assessment }: { assessment: IngredientDetail['assessment'] | undefined }) => {
  if (!assessment) return <Badge variant="outline">Unknown</Badge>;
  const colorMap: Record<IngredientDetail['assessment'], string> = {
    "Generally Safe": "bg-green-100 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600",
    "Use with Caution": "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600",
    "Potential Concern": "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-800 dark:text-orange-200 dark:border-orange-600",
    "Unknown": "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500",
  };
  return <Badge className={`${colorMap[assessment]}`}>{assessment}</Badge>;
};
