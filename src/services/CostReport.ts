// Mock de datos para reportes de costos

// Datos de reportes en memoria
const reports = [
  {
    id: "1",
    name: "Reporte Mensual AWS",
    date_range: "01/07/2025 - 31/07/2025",
    total_cost: 1246.39,
    report_type: "monthly",
    created_date: "2025-08-01T10:30:00Z"
  },
  {
    id: "2",
    name: "Reporte Trimestral - Q2",
    date_range: "01/04/2025 - 30/06/2025",
    total_cost: 3587.92,
    report_type: "quarterly",
    created_date: "2025-07-05T14:15:00Z"
  },
  {
    id: "3",
    name: "Análisis de Costo por Proyecto",
    date_range: "01/06/2025 - 12/08/2025",
    total_cost: 982.45,
    report_type: "custom",
    created_date: "2025-08-12T09:00:00Z"
  }
];

// Define interface for report data
interface ReportData {
  name: string;
  date_range: string;
  total_cost: number;
  report_type: string;
}

// Servicio simple
const CostReport = {
  // Listar reportes
  async list() {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simula retardo
    return [...reports];
  },
  
  // Crear reporte
  async create(reportData: ReportData) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula retardo
    
    const newReport = {
      ...reportData,
      id: `report_${Date.now()}`,
      created_date: new Date().toISOString()
    };
    
    reports.unshift(newReport); // Agregar al inicio
    return newReport;
  }
};

export default CostReport;