import PCSC from "pcsclite"
import fs from "fs"
import { SmardCardReturnData } from "./SmardCardReturnData"
import EventEmitter from "events"
import { apdu } from "./apdu/apdu"
const legacy = require("legacy-encoding")

export default class ThaiIDCardReader {
  private eventEmitter: EventEmitter
  constructor() {
    this.eventEmitter = new EventEmitter()
  }
  onReadComplete(callBack: (data: SmardCardReturnData) => void) {
    this.eventEmitter.on("READ_COMPLETE", (data: SmardCardReturnData) => {
      callBack(data)
    })
  }
  onReadError(callBack: (error: string) => void) {
    this.eventEmitter.on("READ_ERROR", (error: string) => {
      callBack(error)
    })
  }

  init() {
    const that = this
    console.log("ThaiSmartCardConnector init")
    const pcsc = PCSC()
    pcsc.on("reader", function (reader) {
      console.log("New reader detected", reader.name)

      reader.on("error", function (err) {
        console.log("Error(", this.name, "):", err.message)
      })

      reader.on("status", function (status) {
        console.log("Status(", this.name, "):", status)
        /* check what has changed */
        var changes = this.state ^ status.state
        if (changes) {
          if (
            changes & this.SCARD_STATE_EMPTY &&
            status.state & this.SCARD_STATE_EMPTY
          ) {
            console.log("card removed") /* card removed */
            reader.disconnect(reader.SCARD_LEAVE_CARD, function (err) {
              if (err) {
                console.log(err)
              } else {
                console.log("Disconnected")
              }
            })
          } else if (
            changes & this.SCARD_STATE_PRESENT &&
            status.state & this.SCARD_STATE_PRESENT
          ) {
            console.log("card inserted") /* card inserted */
            reader.connect(
              { share_mode: this.SCARD_SHARE_SHARED },
              async function (err, protocol) {
                if (err) {
                  console.log(err)
                } else {
                  console.log("Protocol(", reader.name, "):", protocol)

                  const sendRawCommand = (data: number[]): Promise<Buffer> => {
                    return new Promise((resolve, reject) => {
                      reader.transmit(
                        Buffer.from(data),
                        257,
                        protocol,
                        function (err, data) {
                          if (err) console.log(err)
                          else {
                            resolve(data)
                          }
                        }
                      )
                    })
                  }

                  sendRawCommand(apdu.select)
                  const getData = async (command: number[]) => {
                    let temp = await sendRawCommand(command)
                    let result = await sendRawCommand([
                      ...apdu.getResponse,
                      temp[1],
                    ])
                    result = result.slice(0, -2)
                    console.log(legacy.decode(result, "tis620"))
                    return legacy.decode(result, "tis620")
                  }
                  const getPhoto = async (command: number[]) => {
                    // myTran(APDUCommand.select)
                    let temp = await sendRawCommand(command)
                    let result = await sendRawCommand([
                      ...apdu.getResponse,
                      temp[1],
                    ])
                    result = result.slice(0, -2)
                    return result
                  }
                  let data: Partial<SmardCardReturnData> = {}
                  data.citizenID = await getData(apdu.citizenID)
                  data.fullNameTH = await getData(apdu.fullNameTH)
                  data.fullNameEN = await getData(apdu.fullNameEN)
                  data.gender = await getData(apdu.gender)
                  data.cardIssuer = await getData(apdu.cardIssuer)
                  data.issueDate = await getData(apdu.issueDate)
                  data.expireDate = await getData(apdu.expireDate)
                  data.address = await getData(apdu.address)
                  let photo: Buffer = Buffer.from([])
                  for (let row of apdu.photos) {
                    let tempPhoto = await getPhoto(row)
                    photo = Buffer.concat([photo, tempPhoto])
                  }
                  const content = photo
                  console.log(content)
                  data.photoAsBase64Uri = content.toString("base64")
                  fs.writeFileSync("test.jpg", content, "base64")

                  that.eventEmitter.emit("READ_COMPLETE", data)
                }
              }
            )
          }
        }
      })

      reader.on("end", function () {
        console.log("Reader", this.name, "removed")
      })
    })

    pcsc.on("error", (err) => {
      console.log("PCSC error", err.message)
      this.eventEmitter.emit("READ_ERROR", err.message)
    })
  }
}
