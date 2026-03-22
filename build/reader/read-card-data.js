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
exports.createCommandTransmitter = createCommandTransmitter;
exports.readCardData = readCardData;
const moment_1 = __importDefault(require("moment"));
const apdu_commands_1 = require("../constants/apdu-commands");
const legacy = require("legacy-encoding");
function formatThaiDate(rawValue) {
    return (0, moment_1.default)(rawValue, "YYYYMMDD").add(-543, "years").format("YYYY-MM-DD");
}
function decodeText(buffer) {
    return legacy.decode(buffer, "tis620");
}
function createCommandTransmitter(transmit) {
    return function sendRawCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            return transmit(command, command[command.length - 1] + 2);
        });
    };
}
function readCardData(sendRawCommand) {
    return __awaiter(this, void 0, void 0, function* () {
        const getResponseData = (command) => __awaiter(this, void 0, void 0, function* () {
            const initialResponse = yield sendRawCommand(command);
            const response = yield sendRawCommand([
                ...apdu_commands_1.apdu.getResponse,
                initialResponse[1],
            ]);
            return response.slice(0, -2);
        });
        const getText = (command) => __awaiter(this, void 0, void 0, function* () {
            const response = yield getResponseData(command);
            return decodeText(response);
        });
        const getPhoto = (command) => __awaiter(this, void 0, void 0, function* () {
            return getResponseData(command);
        });
        yield sendRawCommand(apdu_commands_1.apdu.select);
        const photoChunks = [];
        for (const row of apdu_commands_1.apdu.photos) {
            photoChunks.push(yield getPhoto(row));
        }
        const photoBytes = photoChunks.flatMap((chunk) => Array.from(chunk));
        return {
            citizenID: yield getText(apdu_commands_1.apdu.citizenID),
            fullNameTH: yield getText(apdu_commands_1.apdu.fullNameTH),
            fullNameEN: yield getText(apdu_commands_1.apdu.fullNameEN),
            gender: yield getText(apdu_commands_1.apdu.gender),
            cardIssuer: yield getText(apdu_commands_1.apdu.cardIssuer),
            dateOfBirth: formatThaiDate(yield getText(apdu_commands_1.apdu.dateOfBirth)),
            issueDate: formatThaiDate(yield getText(apdu_commands_1.apdu.issueDate)),
            expireDate: formatThaiDate(yield getText(apdu_commands_1.apdu.expireDate)),
            address: yield getText(apdu_commands_1.apdu.address),
            photoAsBase64Uri: Buffer.from(photoBytes).toString("base64"),
        };
    });
}
