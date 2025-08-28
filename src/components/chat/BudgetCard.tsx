"use client";

import React from "react";
import { TrendingUp, DollarSign, Calendar, AlertTriangle } from "lucide-react";

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

interface BudgetCardProps {
  budget: BudgetDeviation;
}

export default function BudgetCard({ budget }: BudgetCardProps) {
  const deviationPercentage = ((budget.calculated_spend.actual_spend / budget.budget_limit.amount) * 100).toFixed(1);
  const isOverBudget = budget.deviation < 0;

  return (
    <div className={`rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-lg ${
      isOverBudget 
        ? 'border-red-200 bg-red-50/50 hover:bg-red-50' 
        : 'border-green-200 bg-green-50/50 hover:bg-green-50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isOverBudget ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {isOverBudget ? (
              <AlertTriangle className="w-5 h-5 text-white" />
            ) : (
              <TrendingUp className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{budget.budget_name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Calendar className="w-3 h-3" />
              <span>{budget.time_unit}</span>
            </div>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isOverBudget 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {deviationPercentage}% usado
        </div>
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/70 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
            <DollarSign className="w-3 h-3" />
            <span>Presupuesto</span>
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {budget.budget_limit.amount.toLocaleString()} {budget.budget_limit.unit}
          </div>
        </div>
        
        <div className="bg-white/70 rounded-lg p-2">
          <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Gastado</span>
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {budget.calculated_spend.actual_spend.toLocaleString()} {budget.calculated_spend.unit}
          </div>
        </div>
      </div>

      {/* Deviation */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">Desviación:</span>
        <div className={`text-sm font-semibold ${
          isOverBudget ? 'text-red-600' : 'text-green-600'
        }`}>
          {isOverBudget ? '+' : ''}{Math.abs(budget.deviation).toLocaleString()} {budget.budget_limit.unit}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ 
              width: `${Math.min(parseFloat(deviationPercentage), 100)}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}