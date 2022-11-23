"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
function sendToServer(data) {
    const url = process.env.URL;
    console.log(process.env);
    if (!url) {
        console.log('invalid url :' + url);
        return null;
    }
    axios_1.default
        .post(url, { data: data })
        .then((result) => {
        console.log("success");
    })
        .catch((error) => {
        console.log(error);
    });
}
exports.default = sendToServer;
