import { Message } from "@/hooks/useChatConversation";

export const generateConversationId = (): string => {
  // Generate a UUID-like string similar to backend
  return crypto.randomUUID().substring(0, 16);
};

export const createWelcomeMessage = (isCleanMode: boolean): Message => {
  if (isCleanMode) {
    return {
      id: "welcome",
      message: "¡Hola! Soy tu asistente inteligente de costos AWS. Puedo ayudarte a analizar gastos, generar reportes, identificar ahorros y responder preguntas sobre tu facturación. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      message_type: "text",
    };
  }
  return {
    id: "welcome",
    message: "¡Hola! 👋 Estos son los presupuestos con mayor desviación del día de hoy:",
    sender: "bot",
    timestamp: new Date().toISOString(),
    message_type: "text",
  };
};

export const createLearnMoreMessage = (budgetName: string): string => {
  return `Hola 👋, acabo de notar que el presupuesto "${budgetName}" está siendo sobrepasado.
¿Podrías darme un desglose detallado de los costos asociados a esta cuenta,
incluyendo el consumo por servicio y los recursos que más contribuyen al gasto?
Además, me gustaría recibir recomendaciones prácticas para optimizar los costos
y evitar futuros excesos en este presupuesto.`;
};
