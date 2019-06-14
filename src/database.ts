import { writeFile, readFile, readFileSync } from "jsonfile";
import { join } from "path";
import fs, { existsSync, renameSync, readdirSync } from "fs";
import shell from "shelljs";
import { filter, reduce } from "lodash";
import { AccessPoints, Muestras } from "../interfaces";
import { parse } from "json2csv";
import { reduccionConsolidado } from "./data";

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

export const guardarJSON = async (
  obj: {},
  name: string,
  replaceExisting = false
) => {
  if (!replaceExisting) renameIfExists(name);

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

export const eliminarData = () => {
  shell.cd(dataPath);
  shell.rm("-rf", "*.json");
  shell.rm("-rf", "*.csv");
};

export const getMuestras = async (): Promise<Muestras> => {
  const fileNames = filter(
    readdirSync(dataPath),
    v => !!v.match(/[1-9]+.json/i)
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

export const saveCSV = (data: any, name: string, opts?: any) => {
  fs.writeFileSync(join(dataPath, `${name}.csv`), parse(data, opts));
};

export const muestrasJSONToCSV = async (data: Readonly<Muestras>) => {
  const accessPoints = await getAccessPoints();
  const csv = parse(reduccionConsolidado(data, accessPoints), {
    fields: [
      {
        label: "Latitud",
        value: "lat",
      },
      {
        label: "Longitud",
        value: "long",
      },
      {
        label: "Numero total de AP o redes",
        value: "numTotalAps",
      },
      {
        label: "Potencia total del punto",
        value: "potenciaTotalPunto",
      },
      {
        label: "Total de canales utilizados",
        value: "totalCanales",
      },
      {
        label: "Canal mas congestionado",
        value: "canalMasCongestionado",
      },
      {
        label: "Numero de AP en el canal mas congestionado",
        value: "numeroDeApEnElCanalMasCongestionado",
      },
      {
        label: "Proveedor con mas redes",
        value: "proveedorConMasRedes",
      },
      {
        label: "Proveedor con mas redes en el mismo canal",
        value: "proveedorConMasRedesEnElMismoCanal",
      },
    ],
  });
  fs.writeFileSync(join(dataPath, "dataConsolidada.csv"), csv);
  return;
};
