export type ChatMessageType = {
  id: number | string;
  message: string;
  sender: "user" | "bot";
  timestamp: string;
  message_type: "text" | "image" | "file";
};

export const ChatMessage = {
  bulkCreate: async (messages: ChatMessageType[]) => {
    return Promise.resolve(messages);
  },
};