import * as jsonfile from "jsonfile";
import * as path from "path";
import * as fs from "fs";

export const guardarJSON = async (obj: {}, name: string, flag = "w") => {
  await jsonfile.writeFile(path.join(__dirname, "../data/", name), obj, {
    flag,
    spaces: 2,
  });
};

const apFile = path.join(__dirname, "../data/accessPoints.json");

export const leerAPFile = async () => {
  let file = {};
  if (fs.existsSync(apFile)) {
    file = await jsonfile.readFile(apFile);
  }

  return file;
};

export const guardarAPFile = async (obj: {}) => {
  await jsonfile.writeFile(apFile, obj, { spaces: 2 });
  return obj;
};
