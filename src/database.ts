import { writeFile, readFile, readFileSync } from "jsonfile";
import { join } from "path";
import { existsSync, renameSync, readdirSync } from "fs";
import shell from "shelljs";
import { without, reduce } from "lodash";
import { AccessPoints, Network, Muestras } from "../interfaces";
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
    "accessPoints.json"
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

export const muestrasJSONToCSV = (data: Readonly<Muestras>) => {
  const csv = parse(data);
  console.log("csv: ", csv);
};
