import { init, scan } from "node-wifi";
import moment from "moment-timezone";
import { map, forEach, defaults } from "lodash";
import { getAccessPoints, saveAccessPoints } from "./database";
import { Network } from "../interfaces";

const getDate = () =>
  moment()
    .tz("America/Santiago")
    .format();

export const scanAccessPoints = async () => {
  init({
    iface: null,
  });

  const networks = await scan();

  const date = getDate();

  return map(
    networks,
    ({ ssid, mac, channel, signal_level, quality }): Network => ({
      ssid,
      mac,
      channel,
      signal_level,
      quality,
      date,
    })
  );
};

export const refreshAccessPoints = async (
  networks: Network[],
  node: number
) => {
  let accessPoints = await getAccessPoints();

  const date = getDate();

  forEach(networks, ({ ssid, mac, channel }) => {
    defaults(accessPoints, {
      [mac]: {
        ssid,
        mac,
        channel,
        node,
        provider: "",
        date,
      },
    });
  });

  await saveAccessPoints(accessPoints);
  return accessPoints;
};
