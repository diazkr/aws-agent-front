import { useState, useEffect } from "react";
import { getBudgetDeviations, BudgetDeviation } from "@/services/budget/budgetService";

interface UseBudgetDeviationsProps {
  userId: string;
  conversationId: string;
  enabled: boolean;
}

export function useBudgetDeviations({ userId, conversationId, enabled }: UseBudgetDeviationsProps) {
  const [budgets, setBudgets] = useState<BudgetDeviation[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setBudgetsLoading(false);
      return;
    }

    const loadBudgets = async () => {
      try {
        setBudgetsLoading(true);
        const budgetData = await getBudgetDeviations({
          user_id: userId,
          conv_id: conversationId
        });
        setBudgets(budgetData.budgets);
      } catch {
        setBudgets([]);
      } finally {
        setBudgetsLoading(false);
      }
    };

    loadBudgets();
  }, [userId, conversationId, enabled]);

  return {
    budgets,
    budgetsLoading,
    currentSlide,
    setCurrentSlide,
  };
}
