import type { SmartCardReturnData } from "./smart-card-return-data";
export type ThaiIdCardReaderOptions = {
    insertCardDelay?: number;
    readTimeout?: number;
};
export default class ThaiIdCardReader {
    private eventEmitter;
    private readTimeout;
    private insertCardDelay;
    constructor(options?: ThaiIdCardReaderOptions);
    setReadTimeout(timeout: number): void;
    setInsertCardDelay(timeout: number): void;
    onReadComplete(callBack: (data: Partial<SmartCardReturnData>) => void): void;
    onReadError(callBack: (error: string) => void): void;
    init(): void;
    private connectAndRead;
    private transmitToCard;
}
