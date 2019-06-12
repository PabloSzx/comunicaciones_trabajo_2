import _ from "lodash";
import { pedirNumeroNodo } from "./cli";
import { getAccessPoints, refreshAccessPoints } from "./wifi";
import { guardarJSON } from "./database";

const main = async () => {
  while (true) {
    const nNodo = await pedirNumeroNodo();
    const networks = await getAccessPoints();

    console.log("nNodo: ", nNodo);
    console.log("networks: ", networks);
    guardarJSON(networks, `${_.toString(nNodo)}.json`);
    refreshAccessPoints(networks, nNodo);
  }
};

main();
