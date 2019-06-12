import * as inquirer from "inquirer";
import * as _ from "lodash";
import { Choices } from "../interfaces/index";

export const pedirNumeroNodo = async () => {
  const answers: { numero_nodo: number } = await inquirer.prompt([
    {
      type: "number",
      name: "numero_nodo",
      message: "Ingrese numero del nodo a analizar:",
    },
  ]);
  return answers.numero_nodo;
};

export const providerChoices = async () => {
  const { provider }: { provider: string } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "¿Que proveedor corresponde?",
      choices: [
        "Indefinido",
        "Telefonica",
        "VTR",
        "Claro",
        "Movistar",
        "Entel",
      ],
      filter: input => {
        switch (input) {
          case "Indefinido":
            return "";
          default:
            return input;
        }
      },
    },
  ]);
  return provider;
};

export const ipInput = async () => {
  const { ip }: { ip: string } = await inquirer.prompt([
    {
      type: "input",
      name: "ip",
      message: "¿Que IP publica le corresponde?",
    },
  ]);
  return ip;
};

export const start = async () => {
  const {
    choice,
  }: {
    choice: Choices;
  } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "¿Que desea hacer?",
      choices: [
        "Realizar muestreo",
        "Completar Access Points",
        "Completar consolidados",
        "Salir",
      ],
    },
  ]);

  return choice;
};
