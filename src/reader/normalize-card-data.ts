import type { SmartCardReturnData } from "../types/smart-card-return-data"
import type { RawCardData } from "./raw-card-data"

function sanitizeText(value: string) {
  return value.replace(/#/g, " ").replace(/\s{2,}/g, " ").trim()
}

function getNamePart(fullName: string, index: number) {
  return sanitizeText(fullName.split("#")[index] ?? "")
}

export function normalizeCardData(
  data: RawCardData
): Partial<SmartCardReturnData> {
  const fullNameTH = sanitizeText(data.fullNameTH ?? "")
  const fullNameEN = sanitizeText(data.fullNameEN ?? "")

  return {
    citizenID: data.citizenID,
    fullNameEN,
    fullNameTH,
    titleEN: getNamePart(data.fullNameEN ?? "", 0),
    firstNameEN: getNamePart(data.fullNameEN ?? "", 1),
    lastNameEN: getNamePart(data.fullNameEN ?? "", 3),
    titleTH: getNamePart(data.fullNameTH ?? "", 0),
    firstNameTH: getNamePart(data.fullNameTH ?? "", 1),
    lastNameTH: getNamePart(data.fullNameTH ?? "", 3),
    dateOfBirth: data.dateOfBirth,
    gender: data.gender === "1" ? "male" : "female",
    cardIssuer: sanitizeText(data.cardIssuer ?? ""),
    issueDate: sanitizeText(data.issueDate ?? ""),
    expireDate: sanitizeText(data.expireDate ?? ""),
    address: sanitizeText(data.address ?? ""),
    photoAsBase64Uri: data.photoAsBase64Uri
      ? `data:image/jpeg;base64,${data.photoAsBase64Uri}`
      : "",
  }
}
