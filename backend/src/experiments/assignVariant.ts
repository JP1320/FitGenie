export function assignVariant(userId: string, experiment: string): "A" | "B" {
  const hash = [...`${experiment}:${userId}`].reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? "A" : "B";
}
