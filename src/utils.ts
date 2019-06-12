export const dbToNW = (db: number) => {
  return Math.pow(10, db / 10) * 1000 * 1000;
};
