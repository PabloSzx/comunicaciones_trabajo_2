import {
  map,
  reduce,
  size,
  uniq,
  groupBy,
  Dictionary,
  max,
  defaults,
} from "lodash";
import {
  Network,
  AccessPoints,
  Muestras,
  AccessPoint,
  DefaultProviders,
  TypeProvider,
} from "../interfaces";
import { dbToNW } from "./utils";
import nodos from "./staticData/nodos.json";

export const nodoEquivalentePosicion = (n: number) => {
  console.log("nodos: ", nodos);
};

export const percentageOfInterval = (n: number, MIN: number, MAX: number) => {
  return (n - MIN) / (MAX - MIN);
};

export const reduccionConsolidado = (
  data: Muestras,
  accessPoints: AccessPoints
) =>
  map(data, (v: Network[], k: string) => {
    const agrupadosPorCanal = reduce(
      groupBy(v, "channel"),
      (ac, v: Network[], channel: string) => {
        if (ac.cantidadCanalMasContestionado < v.length) {
          ac.canalMasCongestionado = channel;
          ac.cantidadCanalMasContestionado = v.length;
        }
        return ac;
      },
      {
        cantidadCanalMasContestionado: 0,
        canalMasCongestionado: "",
      }
    );

    const agrupadosPorProveedor = groupBy(
      reduce(
        v,
        (ac: AccessPoint[], val: Network) => {
          return [
            ...ac,
            {
              ssid: val.ssid,
              mac: val.mac,
              channel: val.channel,
              node: accessPoints[val.mac].node,
              provider: accessPoints[val.mac].provider,
              ip: accessPoints[val.mac].ip,
              date: accessPoints[val.mac].date,
            },
          ];
        },
        []
      ),
      "provider"
    );

    const proveedorConMasRedes = reduce(
      agrupadosPorProveedor,
      (ac, val, provider) => {
        if (ac.nRedesProveedor < val.length) {
          ac.nRedesProveedor = val.length;
          ac.provider = provider;
        }

        return ac;
      },
      {
        nRedesProveedor: 0,
        provider: "",
      }
    );

    const agrupadoPorProveedorYCanal: Dictionary<
      Dictionary<AccessPoint[]>
    > = reduce(
      agrupadosPorProveedor,
      (ac: Dictionary<Dictionary<AccessPoint[]>>, val, provider) => {
        return {
          ...ac,
          [provider]: groupBy(val, "channel"),
        };
      },
      {}
    );

    const proveedorConMasRedesEnElMismoCanal = reduce(
      agrupadoPorProveedorYCanal,
      (ac, val, provider) => {
        const n = max(map(val, v => v.length));
        if (n && n > ac.nCanalProvider) {
          ac.nCanalProvider = n;
          ac.provider = provider;
        }
        return ac;
      },
      {
        provider: "",
        nCanalProvider: 0,
      }
    );

    return {
      lat: k,
      long: k,
      numTotalAps: v.length,
      potenciaTotalPunto: reduce(
        v,
        (ac: number, val) => ac + dbToNW(val.signal_level),
        0
      ),
      totalCanales: size(uniq(map(v, "channel"))),
      canalMasCongestionado: agrupadosPorCanal.canalMasCongestionado,
      numeroDeApEnElCanalMasCongestionado:
        agrupadosPorCanal.cantidadCanalMasContestionado,
      proveedorConMasRedes: proveedorConMasRedes.provider,
      proveedorConMasRedesEnElMismoCanal:
        proveedorConMasRedesEnElMismoCanal.provider,
    };
  });

export const getDefaultProviders = (
  accessPoints: AccessPoints
): DefaultProviders => {
  return reduce(
    accessPoints,
    (acum: DefaultProviders, v): DefaultProviders => {
      if (v.ssid.match(/vtr/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("VTR");
      }

      if (v.ssid.match(/telsur/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("Telsur");
      }

      if (v.ssid.match(/movistar/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("Movistar");
      }

      if (v.ssid.match(/direct/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("DirectTV");
      }

      if (v.ssid.match(/claro/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("Claro");
      }

      if (v.ssid.match(/entel/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("Entel");
      }

      return acum;
    },
    {}
  );
};

export const guessProvider = (
  ap: AccessPoint,
  defaultProviders: DefaultProviders
): TypeProvider => {
  if (ap.ssid.match(/vtr/i)) {
    return "VTR";
  }

  if (ap.ssid.match(/telsur/i)) {
    return "Telsur";
  }

  if (ap.ssid.match(/movistar/i)) {
    return "Movistar";
  }

  if (ap.ssid.match(/direct/i)) {
    return "DirectTV";
  }

  if (ap.ssid.match(/claro/i)) {
    return "Claro";
  }

  if (ap.ssid.match(/entel/i)) {
    return "Entel";
  }

  if (size(defaultProviders[ap.mac.substring(0, 2)]) === 1) {
    return Array.from(defaultProviders[ap.mac.substring(0, 2)])[0];
  }

  return undefined;
};
