export type ChatMessageType = {
  id: number | string;
  message: string;
  sender: "user" | "bot";
  timestamp: string;
  message_type: "text" | "image" | "file";
};

export const ChatMessage = {
  bulkCreate: async (messages: ChatMessageType[]) => {
    // Simula guardar mensajes en la base de datos
    console.log("Mensajes guardados en la base de datos:", messages);
    return Promise.resolve(messages);
  },
};