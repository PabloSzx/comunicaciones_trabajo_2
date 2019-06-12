import _ from "lodash";
import { pedirNumeroNodo, start, providerChoices, ipInput } from "./cli";
import { scanAccessPoints, refreshAccessPoints } from "./wifi";
import { guardarJSON, getAccessPoints, saveAccessPoints } from "./database";
import { AccessPoints, AccessPoint, Choices } from "../interfaces/index";

const muestreo = async () => {
  const nNodo = await pedirNumeroNodo();
  const networks = await scanAccessPoints();

  console.log("nNodo: ", nNodo);
  console.log("networks: ", networks);
  guardarJSON(networks, `${_.toString(nNodo)}.json`);
  refreshAccessPoints(networks, nNodo);
  return;
};

const completarAccessPoints = async (accessPoints: AccessPoints) => {
  const accessPointsList: AccessPoint[] = _.values(accessPoints);

  for (const accessPoint of accessPointsList) {
    if (_.isEmpty(accessPoint.ip) || _.isEmpty(accessPoint.provider)) {
      console.log("AccessPoint: ", accessPoint);
    }
    if (_.isEmpty(accessPoint.ip)) {
      const ip = await ipInput();
      accessPoints[accessPoint.mac].ip = ip;
    }
    if (_.isEmpty(accessPoint.provider)) {
      const provider = await providerChoices();
      accessPoints[accessPoint.mac].provider = provider;
    }
  }

  return accessPoints;
};

const main = async () => {
  let choice: Choices;
  while (choice !== "Salir") {
    choice = await start();
    switch (choice) {
      case "Realizar muestreo": {
        await muestreo();
        break;
      }
      case "Completar Access Points": {
        let accessPoints = await getAccessPoints();
        accessPoints = await completarAccessPoints(accessPoints);
        await saveAccessPoints(accessPoints);
        break;
      }
      case "Completar consolidados": {
        //Por completar
        break;
      }
      case "Salir": {
        console.log("Saludos!");
        break;
      }
      default:
    }
  }

  console.log("Hehe Saludos.");
};

main();
