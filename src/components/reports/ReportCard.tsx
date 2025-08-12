import React from 'react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileBarChart, Download, Eye, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const typeColors = {
  daily: "bg-blue-100 text-blue-800 border-blue-200",
  weekly: "bg-green-100 text-green-800 border-green-200",
  monthly: "bg-purple-100 text-purple-800 border-purple-200",
  custom: "bg-orange-100 text-orange-800 border-orange-200"
};

const typeLabels = {
  daily: "Diario",
  weekly: "Semanal", 
  monthly: "Mensual",
  custom: "Personalizado"
};

type ServiceBreakdown = {
  service_name: string;
  cost: number;
};

type Report = {
  name: string;
  report_type: keyof typeof typeColors;
  date_range: string;
  total_cost: number;
  created_date: string | Date;
  services_breakdown?: ServiceBreakdown[];
};

interface ReportCardProps {
  report: Report;
  index: number;
}

export default function ReportCard({ report, index }: ReportCardProps) {
  console.log(report);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card className="glass-effect border-purple-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileBarChart className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">
                {report.name}
              </CardTitle>
            </div>
            <Badge className={`${typeColors[report.report_type]} border text-xs`}>
              {typeLabels[report.report_type]}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{report.date_range}</span>
            </div>
            
            <div className="text-2xl font-bold text-slate-900">
              ${report.total_cost?.toFixed(2)}
            </div>
            
            <p className="text-sm text-slate-500">
              Generado el {format(new Date(report.created_date), "dd 'de' MMMM", { locale: es })}
            </p>
          </div>

          {/* Preview de servicios principales */}
          {report.services_breakdown && report.services_breakdown.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Servicios Principales
              </p>
              <div className="space-y-1">
                {report.services_breakdown.slice(0, 3).map((service, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{service.service_name}</span>
                    <span className="font-medium text-slate-800">
                      ${service.cost?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 justify-center flex items-center text-xs text-gray-700 py-1">
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
            <Button variant="outline" className="flex-1 justify-center flex items-center text-xs text-gray-700 py-1">
              <Download className="w-3 h-3 mr-1" />
              Descargar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}