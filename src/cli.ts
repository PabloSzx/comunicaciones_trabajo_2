import * as inquirer from "inquirer";

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
