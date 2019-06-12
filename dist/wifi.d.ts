export declare const getAccessPoints: () => Promise<any>;
export declare const refreshAccessPoints: (networks: {
    ssid: string;
    mac: string;
    channel: number;
    signal_level: number;
    quality: number;
}[], node: number) => Promise<{}>;
