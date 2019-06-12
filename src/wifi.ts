import wifi from "node-wifi";
import _ from "lodash";
import { leerAPFile, guardarAPFile } from "./database";

export const getAccessPoints = async () => {
  wifi.init({
    iface: null,
  });

  const networks = await wifi.scan();

  return _.map(networks, ({ ssid, mac, channel, signal_level, quality }) => ({
    ssid,
    mac,
    channel,
    signal_level,
    quality,
  }));
};

export const refreshAccessPoints = async (
  networks: Array<{
    ssid: string;
    mac: string;
    channel: number;
    signal_level: number;
    quality: number;
  }>,
  node: number
) => {
  let accessPoints = await leerAPFile();
  _.forEach(networks, ({ ssid, mac, channel }) => {
    _.defaults(accessPoints, {
      [mac]: {
        ssid,
        mac,
        channel,
        node,
        provider: "",
        ip: "",
      },
    });
  });

  await guardarAPFile(accessPoints);
  return accessPoints;
};
