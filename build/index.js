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
const sendToServer_1 = __importDefault(require("./sendToServer"));
const { ThaiCardReader, EVENTS, MODE } = require('@privageapp/thai-national-id-reader');
const reader = new ThaiCardReader();
reader.readMode = MODE.PERSONAL_PHOTO;
reader.autoRecreate = true;
reader.startListener();
reader.on(EVENTS.READING_COMPLETE, (obj) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(obj);
    yield (0, sendToServer_1.default)(obj);
}));
