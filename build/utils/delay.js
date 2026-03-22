"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
function delay(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
