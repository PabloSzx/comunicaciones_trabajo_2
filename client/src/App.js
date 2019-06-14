import React, { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";
import ReactApexCharts from "react-apexcharts";

export default () => {
  const [data, setData] = useState({});
  useEffect(() => {
    axios.get("http://localhost:8000/data").then(res => {
      console.log("res.data: ", res.data);
      const asd = _.cloneDeep(res.data);
      setData(asd);
    });
  }, []);

  console.log("data: ", data);
  return (
    <div>
      <ReactApexCharts
        type="bar"
        options={{
          xaxis: {
            categories: _.get(data, "labelsProveedor", []),
          },
        }}
        width={700}
        series={[
          {
            name: "Cantidad",
            data: _.get(data, "distProveedor", []),
          },
        ]}
      />

      <ReactApexCharts
        type="bar"
        options={{
          xaxis: {
            categories: _.get(data, "labelsCanales", []),
          },
        }}
        width={700}
        series={[{ name: "Canal", data: _.get(data, "distCanales", []) }]}
      />

      <ReactApexCharts
        type="donut"
        options={{
          labels: _.get(data, "labelsTipos", []),
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    show: true,
                  },
                  value: {
                    show: true,
                  },
                  total: {
                    show: true,
                  },
                },
              },
            },
          },
        }}
        width={700}
        series={_.get(data, "distTipos", [])}
      />
    </div>
  );
};
