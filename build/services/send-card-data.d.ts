import type { SmartCardReturnData } from "../types/smart-card-return-data";
export type CardDataPayload = Partial<SmartCardReturnData>;
export type SendCardDataOptions = {
    url: string;
};
type ServerSuccessResponse = unknown;
export default function sendCardData(data: CardDataPayload, options: SendCardDataOptions): Promise<ServerSuccessResponse>;
export {};
