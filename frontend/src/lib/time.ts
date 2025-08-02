import { Ref } from "vue";

export function elapsedTime(
  roundStart: string,
  now: Ref<number>,
  roundEnd?: string,
): string | null {
  const start = new Date(roundStart).getTime();
  const end = roundEnd ? new Date(roundEnd).getTime() : now.value;

  if (isNaN(start) || isNaN(end) || end < start) return null;

  const elapsedSeconds = Math.floor((end - start) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}
