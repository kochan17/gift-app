export function formatDistanceToNow(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日`;
  if (hours > 0) return `${hours}時間`;
  if (minutes > 0) return `${minutes}分`;
  return 'たった今';
}
