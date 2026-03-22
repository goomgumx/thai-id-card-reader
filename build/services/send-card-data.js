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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendCardData;
const axios_1 = __importDefault(require("axios"));
function getConfiguredUrl(options) {
    const url = options.url.trim();
    if (!url) {
        throw new Error(`Invalid server URL: ${String(options.url)}`);
    }
    try {
        new URL(url);
    }
    catch (_a) {
        throw new Error(`Invalid server URL: ${url}`);
    }
    return url;
}
function sendCardData(data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const url = getConfiguredUrl(options);
        try {
            const result = yield axios_1.default.post(url, { data });
            console.log("sendCardData success", result.status, result.data);
            return result.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const status = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status;
                const responseData = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data;
                throw new Error(`sendCardData failed${status ? ` (${status})` : ""}: ${responseData ? JSON.stringify(responseData) : error.message}`);
            }
            throw error;
        }
    });
}
