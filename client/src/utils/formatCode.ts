export const formatCode = (prefix: string, index: number) => {
  return `${prefix}-${String(index).padStart(3, "0")}`;
};