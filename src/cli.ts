import { prompt } from "inquirer";
import { isNaN } from "lodash";
import { Choices } from "../interfaces";

export const pedirNumeroNodo = async () => {
  const { numero_nodo }: { numero_nodo: number } = await prompt([
    {
      type: "number",
      name: "numero_nodo",
      message: "Ingrese numero del nodo a analizar:",
      validate: n => !isNaN(n) || "Ingrese numero válido!",
    },
  ]);
  return numero_nodo;
};

export const providerChoices = async () => {
  const { provider }: { provider: string } = await prompt([
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
  const { ip }: { ip: string } = await prompt([
    {
      type: "input",
      name: "ip",
      message: "¿Que IP publica le corresponde?",
    },
  ]);
  return ip;
};

export const choiceInput = async () => {
  const {
    choice,
  }: {
    choice: Choices;
  } = await prompt([
    {
      type: "list",
      name: "choice",
      message: "¿Que desea hacer?",
      choices: [
        "Realizar muestreo",
        "Completar Access Points",
        "Completar consolidados",
        "Limpiar Archivos Antiguos",
        "Salir",
      ],
    },
  ]);

  return choice;
};
