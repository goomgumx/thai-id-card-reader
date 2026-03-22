import moment from "moment"

import { apdu } from "../constants/apdu-commands"
import type { RawCardData } from "./raw-card-data"

const legacy = require("legacy-encoding")

type TransmitFn = (
  command: number[],
  expectedLength: number
) => Promise<Buffer>

function formatThaiDate(rawValue: string) {
  return moment(rawValue, "YYYYMMDD").add(-543, "years").format("YYYY-MM-DD")
}

function decodeText(buffer: Buffer) {
  return legacy.decode(buffer, "tis620")
}

export function createCommandTransmitter(
  transmit: TransmitFn
) {
  return async function sendRawCommand(command: number[]) {
    return transmit(command, command[command.length - 1] + 2)
  }
}

export async function readCardData(
  sendRawCommand: (command: number[]) => Promise<Buffer>
): Promise<RawCardData> {
  const getResponseData = async (command: number[]) => {
    const initialResponse = await sendRawCommand(command)
    const response = await sendRawCommand([
      ...apdu.getResponse,
      initialResponse[1],
    ])

    return response.slice(0, -2)
  }

  const getText = async (command: number[]) => {
    const response = await getResponseData(command)
    return decodeText(response)
  }

  const getPhoto = async (command: number[]) => {
    return getResponseData(command)
  }

  await sendRawCommand(apdu.select)

  const photoChunks: Buffer[] = []
  for (const row of apdu.photos) {
    photoChunks.push(await getPhoto(row))
  }
  const photoBytes = photoChunks.flatMap((chunk) => Array.from(chunk))

  return {
    citizenID: await getText(apdu.citizenID),
    fullNameTH: await getText(apdu.fullNameTH),
    fullNameEN: await getText(apdu.fullNameEN),
    gender: await getText(apdu.gender),
    cardIssuer: await getText(apdu.cardIssuer),
    dateOfBirth: formatThaiDate(await getText(apdu.dateOfBirth)),
    issueDate: formatThaiDate(await getText(apdu.issueDate)),
    expireDate: formatThaiDate(await getText(apdu.expireDate)),
    address: await getText(apdu.address),
    photoAsBase64Uri: Buffer.from(photoBytes).toString("base64"),
  }
}
