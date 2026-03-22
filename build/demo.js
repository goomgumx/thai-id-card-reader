"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const API_URL = (_a = process.env.THAI_ID_CARD_API_URL) !== null && _a !== void 0 ? _a : "";
run();
function run() {
    const reader = new index_1.ThaiIdCardReader({
        insertCardDelay: 500,
        readTimeout: 5000,
    });
    console.log("Reader config", {
        insertCardDelay: 500,
        readTimeout: 5000,
    });
    reader.init();
    reader.onReadComplete((data) => __awaiter(this, void 0, void 0, function* () {
        console.log("Card read complete", data);
        if (!API_URL) {
            console.log("Skipping API request because THAI_ID_CARD_API_URL is not set");
            return;
        }
        try {
            const response = yield (0, index_1.sendCardData)(data, { url: API_URL });
            console.log("Server response", response);
        }
        catch (error) {
            console.error("Failed to send card data to server", error);
        }
    }));
    reader.onReadError((error) => {
        console.error("Thai ID card read error", error);
    });
}
