import express from "express";
import { flatten, values, groupBy, reduce, keys, get, defaults } from "lodash";
import cors from "cors";
import { getMuestras, getAccessPoints, guardarJSON } from "./database";
import { filterAccessPointsFueraDeBorde } from "./data";

const app = express();

app.use(cors());

app.get("/data", async (req, res) => {
  const muestras = await getMuestras();
  const APs = await getAccessPoints();
  const networksList = flatten(
    values(filterAccessPointsFueraDeBorde(APs, muestras))
  );
  const agrupadosPorCanal = groupBy(networksList, "channel");

  const distribucionCanales: { [canal: string]: number } = reduce(
    agrupadosPorCanal,
    (ac: { [canal: string]: number }, va, canal) => {
      ac[canal] = va.length;
      return ac;
    },
    {}
  );
  const distribucionPorTipo = reduce(
    networksList,
    (ac: { "2.4Ghz": number; "5Ghz": number }, va) => {
      if (va.channel < 32) {
        ac["2.4Ghz"] += 1;
      } else {
        ac["5Ghz"] += 1;
      }
      return ac;
    },
    { "2.4Ghz": 0, "5Ghz": 0 }
  );
  const distribucionPorProveedor: { [proveedor: string]: number } = reduce(
    networksList,
    (ac: { [proveedor: string]: number }, va) => {
      const proveedor = get(APs[va.mac], "provider") || "Indefinido";

      defaults(ac, {
        [proveedor]: 0,
      });
      ac[proveedor] += 1;

      return ac;
    },
    {}
  );

  const labelsProveedor = keys(distribucionPorProveedor);
  const labelsCanales = keys(distribucionCanales);
  const labelsTipos = keys(distribucionPorTipo);

  const data = {
    labelsProveedor,
    distProveedor: values(distribucionPorProveedor),
    labelsCanales,
    distCanales: values(distribucionCanales),
    labelsTipos,
    distTipos: values(distribucionPorTipo),
  };

  guardarJSON(data, "chartData", true);

  res.send(data);
});

app.listen(8000);
