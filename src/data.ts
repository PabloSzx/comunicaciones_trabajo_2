import _, {
  map,
  reduce,
  size,
  uniq,
  groupBy,
  Dictionary,
  max,
  defaults,
  toString,
} from "lodash";
import {
  Network,
  AccessPoints,
  Muestras,
  AccessPoint,
  DefaultProviders,
  TypeProvider,
} from "../interfaces";
import { dbToNW, nodosPosition } from "./utils";

export const nodoEquivalentePosicion = (n: string) => {
  console.log("nodos: ", nodosPosition[n]);
};

export const percentageOfInterval = (n: number, MIN: number, MAX: number) => {
  return (n - MIN) / (MAX - MIN);
};

const networksThatExistInAnotherRegister = (networks: Network[], register: Network[][]): Network[] => {
  return _.filter(networks, v => {
    for (const i of register) {
      for (const j of i) {
        if (v.mac === j.mac) {
          return true;
        }
      }
    }
    return false;
  })
}

export const reduccionConsolidado = (
  data: Muestras,
  accessPoints: AccessPoints
) => {
  const muestrasNoBorde = _.filter(data, (v, k) => {
    return !nodosPosition[k].borde;
  });
  return map(data, (v: Network[], k: string) => {
    if (nodosPosition[k].borde) {
      v = networksThatExistInAnotherRegister(v, muestrasNoBorde);
    }
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
        if (provider && ac.nRedesProveedor < val.length) {
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
        if (provider && n && n > ac.nCanalProvider) {
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
      nodo: k,
      lat: nodosPosition[k].lat,
      long: nodosPosition[k].long,
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
};

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

      if (v.ssid.match(/telsur|gtd/i)) {
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

      if (v.ssid.match(/wom/i)) {
        defaults(acum, {
          [v.mac.substring(0, 2)]: new Set(),
        });

        acum[v.mac.substring(0, 2)].add("WOM");
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

  if (ap.ssid.match(/telsur|gtd/i)) {
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

  if (ap.ssid.match(/wom/i)) {
    return "WOM";
  }

  if (size(defaultProviders[ap.mac.substring(0, 2)]) === 1) {
    return Array.from(defaultProviders[ap.mac.substring(0, 2)])[0];
  }

  return undefined;
};

export const getPosFromNode = (nodo: string) => {
  const equivs = [
    ["25", "25", "1"],
    ["22", "23", "2"],
    ["23", "20", "3"],
    ["25", "16", "4"],
    ["25", "14", "5"],
    ["26", "10", "6"],
    ["28", "5", "7"],
    ["28", "2", "8"],
    ["24", "7", "9"],
    ["22", "6", "10"],
    ["18", "5", "11"],
    ["15", "4", "12"],
    ["9", "9", "13"],
    ["12", "11", "14"],
    ["14", "12", "15"],
    ["17", "13", "16"],
    ["21", "15", "17"],
    ["20", "19", "18"],
    ["15", "17", "19"],
    ["12", "15", "20"],
    ["10", "14", "21"],
    ["3", "19", "22"],
    ["7", "19", "23"],
    ["10", "19", "24"],
    ["13", "21", "25"],
    ["17", "22", "26"],
    ["21", "27", "27"],
    ["21", "31", "28"],
    ["20", "34", "29"],
    ["19", "36", "30"],
    ["18", "40", "31"],
    ["18", "44", "32"],
    ["17", "47", "33"],
    ["10", "42", "34"],
    ["10", "38", "35"],
    ["10", "34", "36"],
    ["10", "30", "37"],
    ["6", "27", "38"],
    ["3", "26", "39"],
    ["10", "26", "40"],
    ["10", "23", "41"],
    ["23", "38", "42"],
    ["26", "40", "43"],
    ["29", "42", "44"],
    ["28", "45", "45"],
    ["27", "47", "46"],
    ["31", "41", "47"],
    ["34", "43", "48"],
    ["36", "44", "49"],
    ["30", "38", "50"],
    ["31", "35", "51"],
    ["32", "31", "52"],
    ["34", "25", "53"],
    ["35", "21", "54"],
    ["36", "18", "55"],
    ["38", "14", "56"],
    ["38", "11", "57"],
    ["35", "10", "58"],
    ["31", "9", "59"],
    ["28", "8", "60"],
    ["39", "9", "61"],
    ["39", "6", "62"],
    ["41", "12", "63"],
    ["44", "13", "64"],
    ["47", "17", "65"],
    ["48", "21", "66"],
    ["47", "26", "67"],
    ["48", "28", "68"],
    ["36", "30", "69"],
    ["47", "31", "70"],
    ["45", "33", "71"],
    ["45", "37", "72"],
    ["45", "23", "73"],
    ["43", "28", "74"],
    ["42", "31", "75"],
    ["42", "35", "76"],
    ["42", "39", "77"],
    ["41", "42", "78"],
    ["39", "41", "79"],
    ["39", "37", "80"],
    ["36", "35", "81"],
    ["38", "33", "82"],
    ["39", "30", "83"],
    ["35", "29", "84"],
    ["31", "27", "85"],
    ["28", "26", "86"],
  ];

  return _.find(equivs, v => v[2] === nodo);
};
