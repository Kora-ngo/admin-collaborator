import  { messages } from "./message";

export const getMessage = (key: string): string => {
  const found = messages.find((msg) => msg.key === key);
  return found ? found.message : "An unknown message occurred.";
};
