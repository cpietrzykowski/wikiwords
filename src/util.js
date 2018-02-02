export function formatelapsed(elapsed) {
  const ms = Math.floor(elapsed % 1000)
    .toString()
    .padStart(3, '0');
  const s = Math.floor((elapsed / 1000) % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((elapsed / (60 * 1000)) % 60)
    .toString()
    .padStart(2, '0');
  const h = Math.floor((elapsed / (60 * 60 * 1000)) % 24)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}.${ms}`;
}
