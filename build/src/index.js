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
const ThaiIDCardReader_1 = __importDefault(require("./ThaiIDCardReader"));
const sendToServer_1 = __importDefault(require("./sendToServer"));
run();
function run() {
    const reader = new ThaiIDCardReader_1.default();
    reader.init();
    // setInsertCardDelay : if run on windows set it to 1000 or try more than 1000 if it error 
    // macOS set to 0
    reader.setInsertCardDelay(1000);
    // if run on macOS you can remove function setReadTimeout below
    // if you run on windows and it stuck. didn't get any data. try to increase timeout value
    reader.setReadTimeout(10);
    reader.onReadComplete((data) => __awaiter(this, void 0, void 0, function* () {
        console.log("Card read complete", data);
        try {
            const response = yield (0, sendToServer_1.default)(data);
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
