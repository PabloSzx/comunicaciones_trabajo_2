import { readFileSync } from "jsonfile";
import { join } from "path";
import { NodesPosition } from "../interfaces";

export const dbToNW = (db: number) => {
  return Math.pow(10, db / 10) * 1000 * 1000;
};
export const nodosPosition: NodesPosition = readFileSync(
  join(__dirname, "../staticData/nodos.json")
);
