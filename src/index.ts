import { isEmpty, values, toString } from "lodash";
import { pedirNumeroNodo, choiceInput, providerChoices, confirm } from "./cli";
import { scanAccessPoints, refreshAccessPoints } from "./wifi";
import {
  guardarJSON,
  getAccessPoints,
  saveAccessPoints,
  limpiarOldFiles,
  getMuestras,
  muestrasJSONToCSV,
  eliminarData,
} from "./database";
import { AccessPoints, AccessPoint, Choices } from "../interfaces";
import { getDefaultProviders, guessProvider } from "./data";

const muestreo = async () => {
  const nNodo = await pedirNumeroNodo();
  const networks = await scanAccessPoints();

  console.log("nNodo: ", nNodo);
  console.log("networks: ", networks);
  guardarJSON(networks, toString(nNodo));
  refreshAccessPoints(networks, nNodo);
  return;
};

const completarAccessPoints = async (accessPoints: AccessPoints) => {
  const defaultProviders = getDefaultProviders(accessPoints);
  const accessPointsList: AccessPoint[] = values(accessPoints);

  for (const accessPoint of accessPointsList) {
    let provider: boolean | string = isEmpty(accessPoint.provider);

    if (provider) {
      provider = guessProvider(accessPoint, defaultProviders) || "";
      if (!provider) {
        console.log(
          "\n\n--------------------------------------\n",
          `AccessPoint: ${accessPoint.ssid} ${accessPoint.mac}`
        );
        // provider = await providerChoices();
      }
      accessPoints[accessPoint.mac].provider = provider;

      saveAccessPoints(accessPoints);
    }
  }

  return accessPoints;
};

const completarConsolidados = async () => {
  const muestras = await getMuestras();

  muestrasJSONToCSV(muestras);
};

const main = async () => {
  let choice: Choices = undefined;

  while (choice !== "Salir") {
    console.log("\n##################################################\n");
    choice = await choiceInput();
    switch (choice) {
      case "Realizar muestreo": {
        await muestreo();
        break;
      }
      case "Completar Access Points": {
        let accessPoints = await getAccessPoints();

        accessPoints = await completarAccessPoints(accessPoints);
        break;
      }
      case "Completar consolidados": {
        await completarConsolidados();
        break;
      }
      case "Limpiar archivos antiguos": {
        const confirmation = await confirm({
          question:
            "¿Está seguro que sea limpiar los archivos antiguos (*.old.json)?",
        });
        if (confirmation) {
          limpiarOldFiles();
        }
        break;
      }
      case "Guardar total datos": {
        const muestras = await getMuestras();
        guardarJSON(muestras, "totalMuestras", true);
        break;
      }
      case "Eliminar data existente": {
        const confirmation = await confirm({
          question: "¿Está seguro que desea eliminar TODA la data existente?",
          defaultConfirm: false,
        });
        if (confirmation) {
          eliminarData();
        }
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
