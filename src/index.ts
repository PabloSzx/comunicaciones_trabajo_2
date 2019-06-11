import { pedirNumeroNodo } from "./cli";
import { getAccessPoints } from "./wifi";

const main = async () => {
  while (true) {
    const [nNodo, networks] = await Promise.all([
      pedirNumeroNodo(),
      getAccessPoints(),
    ]);

    console.log("nNodo: ", nNodo);
    console.log("networks: ", networks);
  }
};

main();
