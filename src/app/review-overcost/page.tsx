'use client';
import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';

// Types for our cost anomaly data
type CostSeverity = 'High' | 'Medium' | 'Critical';

interface CostAnomaly {
  id: string;
  service: string;
  title: string;
  description: string;
  budget: number;
  currentCost: number;
  deviation: number;
  severity: CostSeverity;}

// Mock data for cost anomalies
const mockCostAnomalies: CostAnomaly[] = [
  {
    id: '1',
    service: 'EC2',
    title: 'EC2 - Production Instances',
    description: 'EC2 instances have exceeded the monthly budget due to unplanned traffic increase',
    budget: 500.00,
    currentCost: 623.50,
    deviation: 24.7,
    severity: 'High'
  },
  {
    id: '2',
    service: 'S3',
    title: 'S3 - Data Storage',
    description: 'Significant increase in S3 storage, possible log accumulation without rotation',
    budget: 200.00,
    currentCost: 312.80,
    deviation: 56.4,
    severity: 'Critical'
  },
  {
    id: '3',
    service: 'RDS',
    title: 'RDS - Main Database',
    description: 'Slight increase in RDS costs due to performance optimizations applied',
    budget: 150.00,
    currentCost: 167.25,
    deviation: 11.5,
    severity: 'Medium'
  },
  {
    id: '4',
    service: 'Lambda',
    title: 'Lambda - Serverless Functions',
    description: 'Increase in Lambda executions due to new functionality implementation',
    budget: 75.00,
    currentCost: 124.35,
    deviation: 65.8,
    severity: 'High',
  }
];

// Badge component for showing severity and status
const Badge = ({ text, type }: { text: string; type: string }) => {
  const getColorClasses = () => {
    switch(type) {
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getColorClasses()}`}>
      {text}
    </span>
  );
};

// Progress bar component for showing budget usage
const BudgetProgressBar = ({ percentage }: { percentage: number }) => {
  // Ensure percentage is not negative and cap it at 200% for display purposes
  const displayPercentage = Math.min(Math.max(percentage, 0), 200);
  
  // Determine color based on percentage
  const getBarColor = () => {
    if (percentage <= 80) return 'bg-green-500';
    if (percentage <= 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="mt-2">
      <div className="text-xs text-right text-gray-800 mb-1">{percentage.toFixed(1)}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${getBarColor()} h-2 rounded-full`} 
          style={{ width: `${Math.min(displayPercentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// Card component for each cost anomaly
const CostAnomalyCard = ({ anomaly }: { anomaly: CostAnomaly }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg text-gray-900 font-semibold">{anomaly.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{anomaly.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs uppercase text-gray-500 font-medium">Budget</p>
          <p className="font-semibold text-gray-500">${anomaly.budget.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 font-medium">Current Cost</p>
          <p className="font-semibold text-red-600">${anomaly.currentCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 font-medium">Deviation</p>
          <p className="font-semibold text-red-600">+{anomaly.deviation}%</p>
        </div>
      </div>
      
      <BudgetProgressBar percentage={anomaly.deviation + 100} />
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="space-x-2">
          <Badge text={anomaly.severity} type={anomaly.severity} />
        </div>

          <button className="text-sm px-3 py-1 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors">
            Investigate
          </button>

      </div>
    </div>
  );
};

export default function ReviewOvercostPage() {
  return (
    <div className="p-8">
    <Card className="glass-effect mb-4 p-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Review Overcost on AWS
             </span>
        </CardTitle>
    </Card>
      
      <div className="grid grid-cols-1 gap-6">
        {mockCostAnomalies.map((anomaly) => (
          <CostAnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </div>
    </div>
  );
}
