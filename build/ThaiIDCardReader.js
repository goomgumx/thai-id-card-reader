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
const pcsclite_1 = __importDefault(require("pcsclite"));
const events_1 = __importDefault(require("events"));
const apdu_1 = require("./apdu/apdu");
const moment_1 = __importDefault(require("moment"));
const legacy = require("legacy-encoding");
class ThaiIDCardReader {
    constructor() {
        this.readTimeout = 1;
        this.insertCardDelay = 2000;
        this.eventEmitter = new events_1.default();
    }
    setReadTimeout(timeout) {
        this.readTimeout = timeout;
    }
    setInsertCardDelay(timeout) {
        this.insertCardDelay = timeout;
    }
    onReadComplete(callBack) {
        this.eventEmitter.on("READ_COMPLETE", (data) => {
            const result = {
                citizenID: data.citizenID,
                fullNameEN: removeJunk(data.fullNameEN),
                fullNameTH: removeJunk(data.fullNameTH),
                titleEN: removeJunk(data.fullNameEN.split('#')[0]),
                firstNameEN: removeJunk(data.fullNameEN.split('#')[1]),
                lastNameEN: removeJunk(data.fullNameEN.split('#')[3]),
                titleTH: removeJunk(data.fullNameTH.split('#')[0]),
                firstNameTH: removeJunk(data.fullNameTH.split('#')[1]),
                lastNameTH: removeJunk(data.fullNameTH.split('#')[3]),
                dateOfBirth: data.dateOfBirth,
                gender: (data.gender === '1') ? 'male' : 'female',
                cardIssuer: removeJunk(data.cardIssuer),
                issueDate: removeJunk(data.issueDate),
                expireDate: removeJunk(data.expireDate),
                address: removeJunk(data.address),
                photoAsBase64Uri: 'data:image/jpeg;base64,' + data.photoAsBase64Uri
            };
            callBack(result);
        });
    }
    onReadError(callBack) {
        this.eventEmitter.on("READ_ERROR", (error) => {
            callBack(error);
        });
    }
    init() {
        const that = this;
        console.log("ThaiSmartCardConnector init");
        const pcsc = (0, pcsclite_1.default)();
        pcsc.on("reader", function (reader) {
            console.log("New reader detected", reader.name);
            reader.on("error", function (err) {
                console.log("Error(", this.name, "):", err.message);
            });
            reader.on("status", function (status) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Status(", this.name, "):", status);
                    /* check what has changed */
                    var changes = this.state ^ status.state;
                    if (changes) {
                        if (changes & this.SCARD_STATE_EMPTY &&
                            status.state & this.SCARD_STATE_EMPTY) {
                            console.log("card removed"); /* card removed */
                            reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("Disconnected");
                                }
                            });
                        }
                        else if (changes & this.SCARD_STATE_PRESENT &&
                            status.state & this.SCARD_STATE_PRESENT) {
                            console.log("card inserted"); /* card inserted */
                            yield delay(that.insertCardDelay);
                            reader.connect({ share_mode: this.SCARD_SHARE_SHARED }, function (err, protocol) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log("Protocol(", reader.name, "):", protocol);
                                        const sendRawCommand = (data) => __awaiter(this, void 0, void 0, function* () {
                                            return new Promise((resolve, reject) => {
                                                reader.transmit(Buffer.from(data), data[data.length - 1] + 2, protocol, function (err, data) {
                                                    if (err) {
                                                        reader.disconnect(() => {
                                                            console.log('transmit error : disconnect');
                                                        });
                                                        console.log(err);
                                                    }
                                                    else {
                                                        resolve(data);
                                                        setTimeout(() => {
                                                            reject();
                                                        }, that.readTimeout);
                                                    }
                                                });
                                            });
                                        });
                                        yield sendRawCommand(apdu_1.apdu.select);
                                        const getData = (command) => __awaiter(this, void 0, void 0, function* () {
                                            let temp = yield sendRawCommand(command);
                                            let result = yield sendRawCommand([
                                                ...apdu_1.apdu.getResponse,
                                                temp[1],
                                            ]);
                                            result = result.slice(0, -2);
                                            // console.log(legacy.decode(result, "tis620"))
                                            return legacy.decode(result, "tis620");
                                        });
                                        const getPhoto = (command) => __awaiter(this, void 0, void 0, function* () {
                                            let temp = yield sendRawCommand(command);
                                            let result = yield sendRawCommand([
                                                ...apdu_1.apdu.getResponse,
                                                temp[1],
                                            ]);
                                            result = result.slice(0, -2);
                                            return result;
                                        });
                                        let data = {};
                                        data.citizenID = yield getData(apdu_1.apdu.citizenID);
                                        data.fullNameTH = yield getData(apdu_1.apdu.fullNameTH);
                                        data.fullNameEN = yield getData(apdu_1.apdu.fullNameEN);
                                        data.gender = yield getData(apdu_1.apdu.gender);
                                        data.cardIssuer = yield getData(apdu_1.apdu.cardIssuer);
                                        data.dateOfBirth = (0, moment_1.default)(yield getData(apdu_1.apdu.dateOfBirth), 'YYYYMMDD').add(-543, 'years').format('YYYY-MM-DD');
                                        data.issueDate = (0, moment_1.default)(yield getData(apdu_1.apdu.issueDate), 'YYYYMMDD').add(-543, 'years').format('YYYY-MM-DD');
                                        data.expireDate = (0, moment_1.default)(yield getData(apdu_1.apdu.expireDate), 'YYYYMMDD').add(-543, 'years').format('YYYY-MM-DD');
                                        data.address = yield getData(apdu_1.apdu.address);
                                        let photo = Buffer.from([]);
                                        for (let row of apdu_1.apdu.photos) {
                                            let tempPhoto = yield getPhoto(row);
                                            photo = Buffer.concat([photo, tempPhoto]);
                                        }
                                        const content = photo;
                                        // console.log(content)
                                        data.photoAsBase64Uri = content.toString("base64");
                                        // fs.writeFileSync("test.jpg", content, "base64")
                                        that.eventEmitter.emit("READ_COMPLETE", data);
                                        reader.disconnect(() => {
                                            console.log('read complete disconnect');
                                        });
                                    }
                                });
                            });
                        }
                    }
                });
            });
            reader.on("end", function () {
                console.log("Reader", this.name, "removed");
            });
        });
        pcsc.on("error", (err) => {
            console.log("PCSC error", err.message);
            this.eventEmitter.emit("READ_ERROR", err.message);
        });
    }
}
exports.default = ThaiIDCardReader;
function removeJunk(str) {
    let temp = str;
    temp = temp.replace(/#/g, ' ');
    temp = temp.replace(/\s{2,}/g, ' ');
    if (temp[temp.length - 1] === ' ')
        temp = temp.slice(0, -1);
    return temp;
}
function delay(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });
}
