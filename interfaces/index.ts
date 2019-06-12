export interface AccessPoint {
  ssid: string;
  mac: string;
  channel: number;
  node: number;
  provider: string;
  ip: string;
}

export interface AccessPoints {
  [mac: string]: AccessPoint;
}

export type Choices =
  | "Realizar muestreo"
  | "Completar Access Points"
  | "Completar consolidados"
  | "Salir";
