export interface AccessPoint {
  ssid: string;
  mac: string;
  channel: number;
  node: number;
  provider: string;
  ip: string;
  date: string;
}

export interface Network {
  ssid: string;
  mac: string;
  channel: number;
  signal_level: number;
  quality: number;
  date: string;
}

export interface Muestras {
  [nameMuestra: string]: Network[];
}

export interface AccessPoints {
  [mac: string]: AccessPoint;
}

export type Choices =
  | "Realizar muestreo"
  | "Completar Access Points"
  | "Completar consolidados"
  | "Limpiar Archivos Antiguos"
  | "Salir"
  | undefined;
