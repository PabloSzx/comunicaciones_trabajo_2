import express from "express";
import _ from "lodash";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/data", async (req, res) => {
  res.send({
    mapaMatriz: [[]],
    data: {},
  });
});

app.listen(8000);
