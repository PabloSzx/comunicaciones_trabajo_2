import { writeFile, readFile, readFileSync } from "jsonfile";
import { join } from "path";
import fs, { existsSync, renameSync, readdirSync } from "fs";
import shell from "shelljs";
import {
  without,
  reduce,
  map,
  size,
  uniq,
  groupBy,
  Dictionary,
  max,
  values,
} from "lodash";
import { AccessPoints, Network, Muestras, AccessPoint } from "../interfaces";
import { parse } from "json2csv";

const jsonExtension = (str: string) => `${str.replace(/.json/g, "")}.json`;
const dataPath = join(__dirname, "../data/");

const renameIfExists = (fileName: string) => {
  const fileNamePath = join(dataPath, jsonExtension(fileName));
  if (existsSync(fileNamePath)) {
    const renamedFileName = `${fileName}.old`;
    renameIfExists(renamedFileName);

    const renamedFileNamePath = join(dataPath, jsonExtension(renamedFileName));

    renameSync(fileNamePath, renamedFileNamePath);
  }
};

export const guardarJSON = async (obj: {}, name: string) => {
  renameIfExists(name);
  const newFilePath = join(dataPath, jsonExtension(name));

  await writeFile(newFilePath, obj, {
    spaces: 2,
  });
};

const apFile = join(dataPath, "accessPoints.json");

export const getAccessPoints = async () => {
  let file: AccessPoints = {};

  if (existsSync(apFile)) {
    file = await readFile(apFile);
  }

  return file;
};

export const saveAccessPoints = async (obj: AccessPoints) => {
  await writeFile(apFile, obj, { spaces: 2 });
  return obj;
};

export const limpiarOldFiles = () => {
  shell.cd(dataPath);
  shell.rm("-rf", "*.old.json");
};

export const getMuestras = async (): Promise<Muestras> => {
  const fileNames = without(
    readdirSync(dataPath),
    "empty",
    "accessPoints.json",
    "csvMuestras.csv"
  );
  return reduce(
    fileNames,
    (acum: Muestras, fileName: string): Muestras => {
      return {
        ...acum,
        [fileName.replace(/.json/, "")]: readFileSync(join(dataPath, fileName)),
      };
    },
    {}
  );
};

export const muestrasJSONToCSV = async (data: Readonly<Muestras>) => {
  const accessPoints = await getAccessPoints();
  const csv = parse(
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
        totalCanales: size(uniq(map(v, "channel"))),
        canalMasCongestionado: agrupadosPorCanal.canalMasCongestionado,
        numeroDeApEnElCanalMasCongestionado:
          agrupadosPorCanal.cantidadCanalMasContestionado,
        proveedorConMasRedes: proveedorConMasRedes.provider,
        proveedorConMasRedesEnElMismoCanal,
      };
    })
  );
  fs.writeFileSync(join(dataPath, "csvMuestras.csv"), csv);
  return;
};
