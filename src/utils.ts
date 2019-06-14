import { NodesPosition } from "../interfaces";
import { get } from "lodash";
import nodoHeatmapEquivalents from "../staticData/nodoHeatmapEquivalents.json";
import nodosJSON from "../staticData/nodos.json";

export const dbToNW = (db: number) => {
  return Math.pow(10, db / 10) * 1000 * 1000;
};
export const nodosPosition: NodesPosition = nodosJSON;

export const getPosFromNode = (nodo: string): [string, string] => {
  return get(nodoHeatmapEquivalents, nodo, ["0", "0"]);
};
