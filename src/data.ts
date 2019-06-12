import { map, reduce, size, uniq, groupBy, Dictionary, max } from "lodash";
import { Network, AccessPoints, Muestras, AccessPoint } from "../interfaces";
import { dbToNW } from "./utils";

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
