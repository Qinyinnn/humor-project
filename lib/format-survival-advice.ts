export function formatSurvivalAdvice(content: string) {
  return content.replace(/\r\n/g, "\n").replace(/\n[ \t]*\n+/g, "\n");
}
