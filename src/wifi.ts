import wifi from "node-wifi";
import _ from "lodash";
import { getAccessPoints, saveAccessPoints } from "./database";
import { Network } from "../interfaces";

export const scanAccessPoints = async () => {
  wifi.init({
    iface: null,
  });

  const networks: Network[] = await wifi.scan();

  return _.map(
    networks,
    ({ ssid, mac, channel, signal_level, quality }): Network => ({
      ssid,
      mac,
      channel,
      signal_level,
      quality,
    })
  );
};

export const refreshAccessPoints = async (
  networks: Network[],
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
