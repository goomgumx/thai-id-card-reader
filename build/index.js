"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCardData = exports.ThaiIdCardReader = void 0;
var thai_id_card_reader_1 = require("./thai-id-card-reader");
Object.defineProperty(exports, "ThaiIdCardReader", { enumerable: true, get: function () { return __importDefault(thai_id_card_reader_1).default; } });
var send_to_server_1 = require("./send-to-server");
Object.defineProperty(exports, "sendCardData", { enumerable: true, get: function () { return __importDefault(send_to_server_1).default; } });
