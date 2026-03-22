"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCardData = normalizeCardData;
function sanitizeText(value) {
    return value.replace(/#/g, " ").replace(/\s{2,}/g, " ").trim();
}
function getNamePart(fullName, index) {
    var _a;
    return sanitizeText((_a = fullName.split("#")[index]) !== null && _a !== void 0 ? _a : "");
}
function normalizeCardData(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const fullNameTH = sanitizeText((_a = data.fullNameTH) !== null && _a !== void 0 ? _a : "");
    const fullNameEN = sanitizeText((_b = data.fullNameEN) !== null && _b !== void 0 ? _b : "");
    return {
        citizenID: data.citizenID,
        fullNameEN,
        fullNameTH,
        titleEN: getNamePart((_c = data.fullNameEN) !== null && _c !== void 0 ? _c : "", 0),
        firstNameEN: getNamePart((_d = data.fullNameEN) !== null && _d !== void 0 ? _d : "", 1),
        lastNameEN: getNamePart((_e = data.fullNameEN) !== null && _e !== void 0 ? _e : "", 3),
        titleTH: getNamePart((_f = data.fullNameTH) !== null && _f !== void 0 ? _f : "", 0),
        firstNameTH: getNamePart((_g = data.fullNameTH) !== null && _g !== void 0 ? _g : "", 1),
        lastNameTH: getNamePart((_h = data.fullNameTH) !== null && _h !== void 0 ? _h : "", 3),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender === "1" ? "male" : "female",
        cardIssuer: sanitizeText((_j = data.cardIssuer) !== null && _j !== void 0 ? _j : ""),
        issueDate: sanitizeText((_k = data.issueDate) !== null && _k !== void 0 ? _k : ""),
        expireDate: sanitizeText((_l = data.expireDate) !== null && _l !== void 0 ? _l : ""),
        address: sanitizeText((_m = data.address) !== null && _m !== void 0 ? _m : ""),
        photoAsBase64Uri: data.photoAsBase64Uri
            ? `data:image/jpeg;base64,${data.photoAsBase64Uri}`
            : "",
    };
}
