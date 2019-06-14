import {
  reduce,
  map,
  forEach,
  toInteger,
  isEmpty,
  values,
  toString,
  toPairs,
} from "lodash";
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
import {
  AccessPoints,
  AccessPoint,
  Choices,
  TypeProvider,
} from "../interfaces";
import {
  getDefaultProviders,
  guessProvider,
  reduccionConsolidado,
} from "./data";
import { getPosFromNode } from "./utils";
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
  guardarJSON(
    reduce(
      defaultProviders,
      (ac: { [patron: string]: TypeProvider[] }, v, k) => {
        ac[k] = Array.from(v);
        return ac;
      },
      {}
    ),
    "defaultProviders",
    true
  );

  const accessPointsList: AccessPoint[] = values(accessPoints);

  for (const accessPoint of accessPointsList) {
    let provider: boolean | string = isEmpty(accessPoint.provider);

    if (provider) {
      provider = guessProvider(accessPoint, defaultProviders) || "";
      if (!provider) {
        console.log(
          "\n\n--------------------------------------\n",
          `AccessPoint sin posible proveedor: ${accessPoint.ssid} ${accessPoint.mac}`
        );
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

  const matriz = map(new Array(50), _v => map(new Array(50), _va => 0));
  forEach(data, v => {
    const posV = getPosFromNode(v.nodo) || ["0", "0"];
    matriz[toInteger(posV[0]) - 1][toInteger(posV[1]) - 1] =
      v.potenciaTotalPunto;
  });

  saveCSV(
    reduce(
      matriz,
      (ac: any[], v, k) => {
        return [
          ...ac,
          ...map(v, (va, ka) => ({ x: k + 1, y: ka + 1, potencia: va })),
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

const manualRefreshAccessPoints = async () => {
  const muestras = await getMuestras();
  for (const [node, networks] of toPairs(muestras)) {
    await refreshAccessPoints(networks, toInteger(node));
  }

  return;
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
      case "Actualizar AccessPoints con las muestras": {
        await manualRefreshAccessPoints();
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
        process.exit(0);
        break;
      }
      default:
    }
  }
};

main();
