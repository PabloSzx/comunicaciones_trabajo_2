import { prompt } from "inquirer";
import { isNaN } from "lodash";
import { Choices } from "../interfaces";

export const confirm = async ({
  question = "¿Está seguro?",
  defaultConfirm = true,
}: {
  question?: string;
  defaultConfirm?: boolean;
}) => {
  const { confirmation }: { confirmation: boolean } = await prompt([
    {
      type: "confirm",
      name: "confirmation",
      message: question,
      default: defaultConfirm,
    },
  ]);
  return confirmation;
};

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
        "Generar data para Heatmap",
        "Limpiar archivos antiguos",
        "Guardar total datos",
        "Eliminar data existente",
        "Salir",
      ],
    },
  ]);

  return choice;
};
