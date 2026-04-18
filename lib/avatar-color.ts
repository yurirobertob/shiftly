// Deterministic avatar color based on name — 5 curated colors
const AVATAR_COLORS = [
  { bg: '#E6F4ED', text: '#0F6E56' },  // verde
  { bg: '#E6F1FB', text: '#185FA5' },  // azul
  { bg: '#FAEEDA', text: '#854F0B' },  // âmbar
  { bg: '#EEEDFE', text: '#534AB7' },  // roxo
  { bg: '#FAECE7', text: '#993C1D' },  // coral
] as const;

export function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
