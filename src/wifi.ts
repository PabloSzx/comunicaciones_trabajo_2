import wifi from "node-wifi";
import _ from "lodash";

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
