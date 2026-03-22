import type { SmartCardReturnData } from "./SmartCardReturnData";
export type CardDataPayload = Partial<SmartCardReturnData>;
type ServerSuccessResponse = unknown;
export default function sendToServer(data: CardDataPayload): Promise<ServerSuccessResponse>;
export {};
