interface BudgetLimit {
  amount: number;
  unit: string;
}

interface CalculatedSpend {
  actual_spend: number;
  unit: string;
}

interface BudgetDeviation {
  budget_name: string;
  time_unit: string;
  budget_limit: BudgetLimit;
  calculated_spend: CalculatedSpend;
  deviation: number;
}

interface BudgetDeviationsResponse {
  budgets: BudgetDeviation[];
  total_budgets: number;
  query_timestamp: string;
}

interface BudgetRequest {
  user_id: string;
  conv_id: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function getBudgetDeviations(request: BudgetRequest): Promise<BudgetDeviationsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/budgets-structured`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data: BudgetDeviationsResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export type { BudgetDeviation, BudgetDeviationsResponse, BudgetRequest };