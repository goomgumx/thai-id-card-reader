import type { SmartCardReturnData } from "../types/smart-card-return-data";
import type { RawCardData } from "./raw-card-data";
export declare function normalizeCardData(data: RawCardData): Partial<SmartCardReturnData>;
