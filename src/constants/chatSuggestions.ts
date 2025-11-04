import { TrendingUp, DollarSign, BarChart3, AlertCircle } from "lucide-react";
import { Suggestion } from "@/components/chat/ChatSuggestions";

export const DEFAULT_CHAT_SUGGESTIONS: Suggestion[] = [
  { text: "¿Cuáles son mis servicios más costosos?", icon: TrendingUp, color: "purple" },
  { text: "¿Cómo puedo reducir costos en EC2?", icon: DollarSign, color: "green" },
  { text: "Genera un reporte de costos mensual", icon: BarChart3, color: "blue" },
  { text: "¿Qué alertas de presupuesto debo configurar?", icon: AlertCircle, color: "orange" },
];
