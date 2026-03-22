import EventEmitter from "events"
import PCSC from "pcsclite"

import type { SmartCardReturnData } from "./smart-card-return-data"
import { normalizeCardData } from "./reader/normalize-card-data"
import {
  createCommandTransmitter,
  readCardData,
} from "./reader/read-card-data"
import { delay } from "./utils/delay"

const READ_COMPLETE_EVENT = "READ_COMPLETE"
const READ_ERROR_EVENT = "READ_ERROR"

export type ThaiIdCardReaderOptions = {
  insertCardDelay?: number
  readTimeout?: number
}

export default class ThaiIdCardReader {
  private eventEmitter: EventEmitter
  private readTimeout = 0
  private insertCardDelay = 2000

  constructor(options: ThaiIdCardReaderOptions = {}) {
    this.eventEmitter = new EventEmitter()
    this.insertCardDelay = options.insertCardDelay ?? this.insertCardDelay
    this.readTimeout = options.readTimeout ?? this.readTimeout
  }

  setReadTimeout(timeout: number) {
    this.readTimeout = timeout
  }

  setInsertCardDelay(timeout: number) {
    this.insertCardDelay = timeout
  }

  onReadComplete(callBack: (data: Partial<SmartCardReturnData>) => void) {
    this.eventEmitter.on(
      READ_COMPLETE_EVENT,
      (data: Partial<SmartCardReturnData>) => {
        callBack(normalizeCardData(data))
      }
    )
  }

  onReadError(callBack: (error: string) => void) {
    this.eventEmitter.on(READ_ERROR_EVENT, (error: string) => {
      callBack(error)
    })
  }

  init() {
    console.log("ThaiSmartCardConnector init")

    const pcsc = PCSC()
    pcsc.on("reader", (reader) => {
      console.log("New reader detected", reader.name)

      reader.on("error", (err) => {
        console.log("Error(", reader.name, "):", err.message)
      })

      reader.on("status", async (status) => {
        console.log("Status(", reader.name, "):", status)

        const changes = reader.state ^ status.state
        if (!changes) {
          return
        }

        if (
          changes & reader.SCARD_STATE_EMPTY &&
          status.state & reader.SCARD_STATE_EMPTY
        ) {
          console.log("card removed")
          reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
            if (err) {
              console.log(err)
              return
            }

            console.log("Disconnected")
          })
          return
        }

        if (
          changes & reader.SCARD_STATE_PRESENT &&
          status.state & reader.SCARD_STATE_PRESENT
        ) {
          console.log("card inserted")
          await delay(this.insertCardDelay)
          this.connectAndRead(reader)
        }
      })

      reader.on("end", () => {
        console.log("Reader", reader.name, "removed")
      })
    })

    pcsc.on("error", (err) => {
      console.log("PCSC error", err.message)
      this.eventEmitter.emit(READ_ERROR_EVENT, err.message)
    })
  }

  private connectAndRead(reader: any) {
    reader.connect(
      { share_mode: reader.SCARD_SHARE_SHARED },
      async (err: Error | null, protocol: number) => {
        if (err) {
          console.log(err)
          this.eventEmitter.emit(READ_ERROR_EVENT, err.message)
          return
        }

        console.log("Protocol(", reader.name, "):", protocol)

        try {
          const sendRawCommand = createCommandTransmitter((command, expected) =>
            this.transmitToCard(reader, protocol, command, expected)
          )
          const data = await readCardData(sendRawCommand)

          this.eventEmitter.emit(READ_COMPLETE_EVENT, data)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error)
          console.log(error)
          this.eventEmitter.emit(READ_ERROR_EVENT, message)
        } finally {
          reader.disconnect(() => {
            console.log("read complete disconnect")
          })
        }
      }
    )
  }

  private transmitToCard(
    reader: any,
    protocol: number,
    command: number[],
    expectedLength: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let timeoutHandle: NodeJS.Timeout | undefined

      if (this.readTimeout > 0) {
        timeoutHandle = setTimeout(() => {
          reject(new Error("Smart card read timeout"))
        }, this.readTimeout)
      }

      reader.transmit(
        Buffer.from(command),
        expectedLength,
        protocol,
        (err: Error | null, data: Buffer) => {
          if (timeoutHandle) {
            clearTimeout(timeoutHandle)
          }

          if (err) {
            reject(err)
            return
          }

          resolve(data)
        }
      )
    })
  }
}
