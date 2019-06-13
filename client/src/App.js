import React from "react";
import Heatmap from "react-simple-heatmap";
import houseRadio from "./static/mapa.jpeg";
import _ from "lodash";
export default () => {
  const data = _.map(new Array(25), v =>
    _.map(new Array(25), v => _.random(0, 100))
  );
  return (
    <div>
      <div
        style={{
          height: "833px",
          width: "995px",
          opacity: 0.5,
          zIndex: 1,
        }}
      >
        <Heatmap data={data} />
      </div>
      <img
        style={{ position: "absolute", top: 0, zIndex: -1 }}
        src={houseRadio}
      />
    </div>
  );
};
