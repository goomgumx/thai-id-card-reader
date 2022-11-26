import { SmartCardReturnData } from "./SmartCardReturnData";
export default class ThaiIDCardReader {
    private eventEmitter;
    private readTimeout;
    private insertCardDelay;
    constructor();
    setReadTimeout(timeout: number): void;
    setInsertCardDelay(timeout: number): void;
    onReadComplete(callBack: (data: Partial<SmartCardReturnData>) => void): void;
    onReadError(callBack: (error: string) => void): void;
    init(): void;
}
