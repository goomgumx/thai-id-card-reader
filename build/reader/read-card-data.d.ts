import type { RawCardData } from "./raw-card-data";
type TransmitFn = (command: number[], expectedLength: number) => Promise<Buffer>;
export declare function createCommandTransmitter(transmit: TransmitFn): (command: number[]) => Promise<Buffer>;
export declare function readCardData(sendRawCommand: (command: number[]) => Promise<Buffer>): Promise<RawCardData>;
export {};
