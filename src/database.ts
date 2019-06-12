import jsonfile from "jsonfile";
import path from "path";
import fs from "fs";
import { AccessPoints } from "../interfaces";

export const guardarJSON = async (obj: {}, name: string, flag = "w") => {
  await jsonfile.writeFile(path.join(__dirname, "../data/", name), obj, {
    flag,
    spaces: 2,
  });
};

const apFile = path.join(__dirname, "../data/accessPoints.json");

export const getAccessPoints = async () => {
  let file: AccessPoints = {};

  if (fs.existsSync(apFile)) {
    file = await jsonfile.readFile(apFile);
  }

  return file;
};

export const saveAccessPoints = async (obj: AccessPoints) => {
  await jsonfile.writeFile(apFile, obj, { spaces: 2 });
  return obj;
};
