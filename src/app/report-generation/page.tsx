"use client";
import React, { useState, useEffect } from "react";
import { 
  FileBarChart,
  Plus,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import ReportGenerator from "@/components/reports/ReportGeneration";
import ReportCard from "@/components/reports/ReportCard";
import CostReport from "@/services/CostReport";
import { Card, CardTitle } from "@/components/ui/Card";

type Report = {
  id: string;
  name: string;
  date_range: string;
  total_cost: number;
  report_type: "monthly" | "custom" | "daily" | "weekly";
  created_date: string;
};

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    const data = await CostReport.list();
    setReports(
      data.map((report: { id: string; name: string; date_range: string; total_cost: number; report_type: string; created_date: string; }) => ({
        ...report,
        report_type: report.report_type as "monthly" | "custom" | "daily" | "weekly"
      }))
    );
    setIsLoading(false);
  };

interface ReportData {
    name: string;
    dateRange: string;
    type: string;
}

interface NewReport {
    name: string;
    date_range: string;
    total_cost: number;
    report_type: string;
}

const handleGenerateReport = async (reportData: ReportData): Promise<void> => {
    setIsGenerating(true);
    try {
        // Crear un nuevo reporte con datos de ejemplo
        const newReport: NewReport = {
            name: reportData.name,
            date_range: reportData.dateRange,
            total_cost: 1500 + Math.random() * 1000, // Valor aleatorio entre 1500-2500
            report_type: reportData.type
        };

        await CostReport.create(newReport);
        setShowGenerator(false);
        loadReports();
    } catch (error) {
        console.error("Error generando reporte:", error);
    }
    setIsGenerating(false);
};

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <Card className="glass-effect p-4 flex justify-between w-full">
            <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Report Generation
                </span>
            </CardTitle>
                      
          <Button 
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Reporte
          </Button>
        </Card>

        </motion.div>

        {/* Report Generator */}
        <AnimatePresence>
          {showGenerator && (
            <ReportGenerator
              onGenerate={handleGenerateReport}
              onCancel={() => setShowGenerator(false)}
              isGenerating={isGenerating}
            />
          )}
        </AnimatePresence>

        {/* Reports Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Reportes Existentes</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileBarChart className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No hay reportes aún
              </h3>
              <p className="text-slate-600 mb-6">
                Crea tu primer reporte para comenzar a analizar tus costos AWS
              </p>
              <Button
                onClick={() => setShowGenerator(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Reporte
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {reports.map((report, index) => (
                <ReportCard
                  key={index} 
                  report={report} 
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}