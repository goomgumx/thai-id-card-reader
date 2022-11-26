"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_json_1 = __importDefault(require("../config.json"));
function sendToServer(data) {
    const url = config_json_1.default === null || config_json_1.default === void 0 ? void 0 : config_json_1.default.url;
    if (!url) {
        console.log("invalid url :" + url);
        return null;
    }
    axios_1.default
        .post(url, { data: data })
        .then((result) => {
        console.log("success", result.data);
    })
        .catch((error) => {
        console.log(error);
    });
}
exports.default = sendToServer;
