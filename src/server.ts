import express from "express";
import _ from "lodash";
import cors from "cors";
import { getMuestras, getAccessPoints } from "./database";

const app = express();

app.use(cors());

app.get("/data", async (req, res) => {
  const muestras = await getMuestras();
  const APs = await getAccessPoints();
  const networksList = _.flatten(_.values(muestras));
  const agrupadosPorCanal = _.groupBy(networksList, "channel");

  const distribucionCanales: { [canal: string]: number } = _.reduce(
    agrupadosPorCanal,
    (ac: { [canal: string]: number }, va, canal) => {
      ac[canal] = va.length;
      return ac;
    },
    {}
  );
  const distribucionPorTipo = _.reduce(
    networksList,
    (ac: { "2.4g": number; "5g": number }, va) => {
      if (va.channel < 32) {
        ac["2.4g"] += 1;
      } else {
        ac["5g"] += 1;
      }
      return ac;
    },
    { "2.4g": 0, "5g": 0 }
  );
  const distribucionPorProveedor: { [proveedor: string]: number } = _.reduce(
    networksList,
    (ac: { [proveedor: string]: number }, va) => {
      const proveedor = _.get(APs[va.mac], "provider");
      if (proveedor) {
        _.defaults(ac, {
          [proveedor]: 0,
        });
        ac[proveedor] += 1;
      }
      return ac;
    },
    {}
  );

  const labelsProveedor = _.keys(distribucionPorProveedor);
  const labelsCanales = _.keys(distribucionCanales);
  const labelsTipos = _.keys(distribucionPorTipo);

  //reduccionConsolidado(muestras, APs);
  res.send({
    labelsProveedor,
    distProveedor: _.values(distribucionPorProveedor),
    labelsCanales,
    distCanales: _.values(distribucionCanales),
    labelsTipos,
    distTipos: _.values(distribucionPorTipo),
  });
});

app.listen(8000);
