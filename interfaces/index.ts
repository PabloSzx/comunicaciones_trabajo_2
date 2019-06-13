export interface AccessPoint {
  ssid: string;
  mac: string;
  channel: number;
  node: number;
  provider: string;
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

export interface DefaultProviders {
  [mac: string]: Set<TypeProvider>;
}

export type TypeProvider =
  | "VTR"
  | "Telsur"
  | "Movistar"
  | "DirectTV"
  | "Claro"
  | "Entel"
  | "WOM"
  | undefined;

export type Choices =
  | "Realizar muestreo"
  | "Completar Access Points"
  | "Completar consolidados"
  | "Limpiar archivos antiguos"
  | "Guardar total datos"
  | "Eliminar data existente"
  | "Salir"
  | undefined;
