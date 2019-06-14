import _, { isEmpty, values, toString } from "lodash";
import { writeFileSync } from "fs";
import path from "path";
import { pedirNumeroNodo, choiceInput, confirm } from "./cli";
import { scanAccessPoints, refreshAccessPoints } from "./wifi";
import {
  guardarJSON,
  getAccessPoints,
  saveAccessPoints,
  limpiarOldFiles,
  getMuestras,
  muestrasJSONToCSV,
  eliminarData,
  saveCSV,
} from "./database";
import { AccessPoints, AccessPoint, Choices } from "../interfaces";
import {
  getDefaultProviders,
  guessProvider,
  reduccionConsolidado,
  getPosFromNode,
} from "./data";
import "./server";

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

const generarDataHeatmap = async () => {
  const muestras = await getMuestras();
  const accessPoints = await getAccessPoints();
  const data = reduccionConsolidado(muestras, accessPoints);

  const matriz = _.map(new Array(50), _v => _.map(new Array(50), _va => 0));
  _.forEach(data, v => {
    const posV = getPosFromNode(v.nodo) || ["0", "0"];
    matriz[_.toInteger(posV[0]) - 1][_.toInteger(posV[1]) - 1] =
      v.potenciaTotalPunto;
  });

  saveCSV(
    _.reduce(
      matriz,
      (ac: any[], v, k) => {
        return [
          ...ac,
          ..._.map(v, (va, ka) => ({ x: k + 1, y: ka + 1, potencia: va })),
        ];
      },
      []
    ),
    "dataHeatmap",
    {
      fields: [
        {
          label: "x",
          value: "x",
        },
        {
          label: "y",
          value: "y",
        },
        {
          label: "value",
          value: "potencia",
        },
      ],
    }
  );
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
      case "Generar data para Heatmap": {
        await generarDataHeatmap();
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
