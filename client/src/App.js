import React, { useState, useEffect } from "react";
import axios from "axios";
import Heatmap from "react-simple-heatmap";
import houseRadio from "./static/mapa.png";
import _ from "lodash";
export default () => {
  const [mapaRadioCalor, setMapaRadioCalor] = useState(
    _.map(new Array(25), v => _.map(new Array(25), v => _.random(0, 1) * 100))
  );
  useEffect(() => {
    axios.get("http://localhost:8000/data").then(res => {
      console.log("res.data: ", res.data);
      setMapaRadioCalor(res.data.mapaMatriz);
    });
  }, []);
  console.log("mapaRadioCalor: ", mapaRadioCalor);
  return (
    <div>
      <div
        style={{
          height: "750px",
          width: "750px",
          opacity: 0.5,
          zIndex: 1,
        }}
      >
        <Heatmap data={mapaRadioCalor} showData={false} />
      </div>
      <img
        style={{ position: "absolute", top: 0, zIndex: -1 }}
        src={houseRadio}
      />
    </div>
  );
};
