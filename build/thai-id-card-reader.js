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
const events_1 = __importDefault(require("events"));
const pcsclite_1 = __importDefault(require("pcsclite"));
const normalize_card_data_1 = require("./reader/normalize-card-data");
const read_card_data_1 = require("./reader/read-card-data");
const delay_1 = require("./utils/delay");
const READ_COMPLETE_EVENT = "READ_COMPLETE";
const READ_ERROR_EVENT = "READ_ERROR";
class ThaiIdCardReader {
    constructor(options = {}) {
        var _a, _b;
        this.readTimeout = 0;
        this.insertCardDelay = 2000;
        this.eventEmitter = new events_1.default();
        this.insertCardDelay = (_a = options.insertCardDelay) !== null && _a !== void 0 ? _a : this.insertCardDelay;
        this.readTimeout = (_b = options.readTimeout) !== null && _b !== void 0 ? _b : this.readTimeout;
    }
    setReadTimeout(timeout) {
        this.readTimeout = timeout;
    }
    setInsertCardDelay(timeout) {
        this.insertCardDelay = timeout;
    }
    onReadComplete(callBack) {
        this.eventEmitter.on(READ_COMPLETE_EVENT, (data) => {
            callBack((0, normalize_card_data_1.normalizeCardData)(data));
        });
    }
    onReadError(callBack) {
        this.eventEmitter.on(READ_ERROR_EVENT, (error) => {
            callBack(error);
        });
    }
    init() {
        console.log("ThaiSmartCardConnector init");
        const pcsc = (0, pcsclite_1.default)();
        pcsc.on("reader", (reader) => {
            console.log("New reader detected", reader.name);
            reader.on("error", (err) => {
                console.log("Error(", reader.name, "):", err.message);
            });
            reader.on("status", (status) => __awaiter(this, void 0, void 0, function* () {
                console.log("Status(", reader.name, "):", status);
                const changes = reader.state ^ status.state;
                if (!changes) {
                    return;
                }
                if (changes & reader.SCARD_STATE_EMPTY &&
                    status.state & reader.SCARD_STATE_EMPTY) {
                    console.log("card removed");
                    reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log("Disconnected");
                    });
                    return;
                }
                if (changes & reader.SCARD_STATE_PRESENT &&
                    status.state & reader.SCARD_STATE_PRESENT) {
                    console.log("card inserted");
                    yield (0, delay_1.delay)(this.insertCardDelay);
                    this.connectAndRead(reader);
                }
            }));
            reader.on("end", () => {
                console.log("Reader", reader.name, "removed");
            });
        });
        pcsc.on("error", (err) => {
            console.log("PCSC error", err.message);
            this.eventEmitter.emit(READ_ERROR_EVENT, err.message);
        });
    }
    connectAndRead(reader) {
        reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                console.log(err);
                this.eventEmitter.emit(READ_ERROR_EVENT, err.message);
                return;
            }
            console.log("Protocol(", reader.name, "):", protocol);
            try {
                const sendRawCommand = (0, read_card_data_1.createCommandTransmitter)((command, expected) => this.transmitToCard(reader, protocol, command, expected));
                const data = yield (0, read_card_data_1.readCardData)(sendRawCommand);
                this.eventEmitter.emit(READ_COMPLETE_EVENT, data);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.log(error);
                this.eventEmitter.emit(READ_ERROR_EVENT, message);
            }
            finally {
                reader.disconnect(() => {
                    console.log("read complete disconnect");
                });
            }
        }));
    }
    transmitToCard(reader, protocol, command, expectedLength) {
        return new Promise((resolve, reject) => {
            let timeoutHandle;
            if (this.readTimeout > 0) {
                timeoutHandle = setTimeout(() => {
                    reject(new Error("Smart card read timeout"));
                }, this.readTimeout);
            }
            reader.transmit(Buffer.from(command), expectedLength, protocol, (err, data) => {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }
}
exports.default = ThaiIdCardReader;
