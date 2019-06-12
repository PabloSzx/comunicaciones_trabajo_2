interface Network {
  ssid: string;
  mac: string;
  channel: number;
  signal_level: number;
  quality: number;
}

declare module "node-wifi" {
  function init({ iface }: { iface: string | null }): void;
  function scan(): Promise<Network[]>;
}
