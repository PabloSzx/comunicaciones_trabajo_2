import React, { useState, useEffect } from "react";
import axios from "axios";
import { isEmpty, get, cloneDeep } from "lodash";
import ReactApexCharts from "react-apexcharts";

var dataFetchInterval = 0;

export default () => {
  const [data, setData] = useState({});
  useEffect(() => {
    dataFetchInterval = setInterval(() => {
      getData();
    }, 1000);
    getData();
  }, []);

  useEffect(() => {
    if (!isEmpty(data)) {
      clearInterval(dataFetchInterval);
    }
  }, [data]);

  const getData = () => {
    axios
      .get(
        process.env.NODE_ENV === "production"
          ? "/data"
          : "http://localhost:8000/data"
      )
      .then(res => {
        console.log("res.data: ", res.data);
        const d = cloneDeep(res.data);
        setData(d);
      });
  };

  return (
    <div>
      {isEmpty(data) ? (
        <h1>
          Data no encontrada, asegurese de tener la aplicación corriendo en
          segundo plano
        </h1>
      ) : null}
      <ReactApexCharts
        type="bar"
        options={{
          xaxis: {
            categories: get(data, "labelsProveedor", []),
          },
        }}
        width={700}
        series={[
          {
            name: "Cantidad",
            data: get(data, "distProveedor", []),
          },
        ]}
      />

      <ReactApexCharts
        type="bar"
        options={{
          xaxis: {
            categories: get(data, "labelsCanales", []),
          },
        }}
        width={700}
        series={[{ name: "Canal", data: get(data, "distCanales", []) }]}
      />

      <ReactApexCharts
        type="donut"
        options={{
          labels: get(data, "labelsTipos", []),
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
        series={get(data, "distTipos", [])}
      />
    </div>
  );
};
