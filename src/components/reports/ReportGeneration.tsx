import React, { useState } from 'react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, FileBarChart, X } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select, { SingleValue, StylesConfig } from 'react-select';

// Definiciones de tipos
type ReportGeneratorProps = {
  onGenerate: (data: { name: string; type: string; dateRange: string }) => void;
  onCancel: () => void;
  isGenerating: boolean;
};

type TypeOption = {
  value: string;
  label: string;
};

type CustomButtonProps = {
  value?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
};

// Tipos para los estilos de react-select
type ControlProps = {
  isFocused: boolean;
};

type OptionProps = {
  isSelected: boolean;
  isFocused: boolean;
};

// Opciones para el selector
const typeOptions: TypeOption[] = [
  { value: 'monthly', label: 'Reporte Mensual' },
  { value: 'weekly', label: 'Reporte Semanal' },
  { value: 'daily', label: 'Reporte Diario' },
  { value: 'custom', label: 'Reporte Personalizado' },
];

// Componente personalizado para el DatePicker con tipos adecuados
const CustomDatePickerButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ value, onClick, icon }, ref) => (
    <button
      className="w-full h-10 px-3 flex items-center justify-between text-gray-700 bg-white border rounded-md border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 hover:border-purple-400 transition-colors"
      onClick={onClick}
      ref={ref}
      type="button" // Importante: evita envíos accidentales del formulario
    >
      <span>{value}</span>
      {icon || <CalendarIcon className="h-4 w-4 text-purple-500" />}
    </button>
  )
);

CustomDatePickerButton.displayName = "CustomDatePickerButton";

// Estilos personalizados para react-select con tipos adecuados
const selectStyles: StylesConfig<TypeOption, false> = {
  control: (base, state: ControlProps) => ({
    ...base,
    height: '40px',
    borderColor: state.isFocused ? '#A855F7' : '#E9D5FF80',
    boxShadow: state.isFocused ? '0 0 0 1px #A855F780' : 'none',
    '&:hover': {
      borderColor: '#A855F7',
    },
    borderRadius: '0.375rem',
  }),
  option: (base, state: OptionProps) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#D8B4FE' 
      : state.isFocused 
        ? '#F3E8FF' 
        : base.backgroundColor as string,
    color: state.isSelected ? '#4B0082' : '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#E9D5FF',
    }
  }),
  menu: (base) => ({
    ...base,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    borderRadius: '0.5rem',
    border: '1px solid #E9D5FF80',
    zIndex: 100,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 12px',
  }),
  singleValue: (base) => ({
    ...base,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
};

export default function ReportGenerator({ onGenerate, onCancel, isGenerating }: ReportGeneratorProps) {
  const [reportData, setReportData] = useState({
    name: "",
    type: "monthly",
    startDate: new Date(),
    endDate: new Date()
  });

  // Manejador de envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    
    if (!reportData.name) return; // Validación básica
    
    const dateRange = `${format(reportData.startDate, 'dd/MM/yyyy')} - ${format(reportData.endDate, 'dd/MM/yyyy')}`;
    onGenerate({
      name: reportData.name,
      type: reportData.type,
      dateRange: dateRange
    });
  };

  // Manejador para cambios en el selector
  const handleSelectChange = (option: SingleValue<TypeOption>) => {
    if (option) {
      setReportData({...reportData, type: option.value});
    }
  };

  // CSS personalizado para el DatePicker
  const datepickerWrapperClass = "react-datepicker-wrapper w-full";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-effect border-purple-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileBarChart className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800">Generar Nuevo Reporte</CardTitle>
            </div>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="report-name">
                Nombre del Reporte
              </label>
              <Input
                value={reportData.name}
                onChange={(e) => setReportData({...reportData, name: e.target.value})}
                placeholder="Ej: Reporte Mensual de Costos AWS"
                className="w-full border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="report-type">
                Tipo de Reporte
              </label>
              <Select
                inputId="report-type"
                options={typeOptions}
                value={typeOptions.find(option => option.value === reportData.type)}
                onChange={handleSelectChange}
                styles={selectStyles}
                isSearchable={false}
                className="text-gray-700"
                classNamePrefix="select"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="start-date">
                  Fecha de Inicio
                </label>
                <DatePicker
                  id="start-date"
                  selected={reportData.startDate}
                  onChange={(date: Date | null) => date && setReportData({...reportData, startDate: date})}
                  dateFormat="d 'de' MMMM, yyyy"
                  locale={es}
                  wrapperClassName={datepickerWrapperClass}
                  customInput={<CustomDatePickerButton />}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="end-date">
                  Fecha de Fin
                </label>
                <DatePicker
                  id="end-date"
                  selected={reportData.endDate}
                  onChange={(date: Date | null) => date && setReportData({...reportData, endDate: date})}
                  dateFormat="d 'de' MMMM, yyyy"
                  locale={es}
                  wrapperClassName={datepickerWrapperClass}
                  customInput={<CustomDatePickerButton />}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="text-gray-700 px-6"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isGenerating || !reportData.name}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center p-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}