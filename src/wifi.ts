import * as wifi from "node-wifi";
import * as _ from "lodash";
import { getAccessPoints, saveAccessPoints } from "./database";

export const scanAccessPoints = async () => {
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
  let accessPoints = await getAccessPoints();
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

  await saveAccessPoints(accessPoints);
  return accessPoints;
};
