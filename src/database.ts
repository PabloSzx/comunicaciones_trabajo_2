import { writeFile, readFile } from "jsonfile";
import { join } from "path";
import { existsSync, renameSync } from "fs";
import { AccessPoints } from "../interfaces";

const jsonExtension = (str: string) => `${str.replace(/.json/g, "")}.json`;
const dataPath = join(__dirname, "../data/");

const renameIfExists = (fileName: string) => {
  const fileNamePath = join(dataPath, jsonExtension(fileName)); // el archivo que se intenta guardar
  if (existsSync(fileNamePath)) {
    // el archivo ya existe, debo renombrar el archivo ya existente con un .old al final
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
