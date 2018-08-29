export default function sortNumbersAndLetters(a, b) {
  const ac = Number(a) || a.charCodeAt(0);
  const bc = Number(b) || b.charCodeAt(0);
  if (ac < bc) return -1;
  if (ac > bc) return 1;
  return 0;
}
