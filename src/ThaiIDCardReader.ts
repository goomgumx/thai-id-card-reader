import PCSC from "pcsclite"
import { SmartCardReturnData } from "./SmartCardReturnData"
import EventEmitter from "events"
import { apdu } from "./apdu/apdu"
import moment from 'moment'
const legacy = require("legacy-encoding")

export default class ThaiIDCardReader {
  private eventEmitter: EventEmitter
  private readTimeout = 1
  private insertCardDelay = 2000
  constructor() {
    this.eventEmitter = new EventEmitter()
  }
  setReadTimeout(timeout : number) {
    this.readTimeout = timeout
  }
  setInsertCardDelay(timeout : number) {
    this.insertCardDelay = timeout
  }
  onReadComplete(callBack: (data: Partial<SmartCardReturnData>) => void) {
    this.eventEmitter.on("READ_COMPLETE", (data: SmartCardReturnData) => {
    
      const result : Partial<SmartCardReturnData> = {
        citizenID : data.citizenID,
        fullNameEN : removeJunk(data.fullNameEN),
        fullNameTH : removeJunk(data.fullNameTH),
        titleEN : removeJunk(data.fullNameEN.split('#')[0]),
        firstNameEN : removeJunk( data.fullNameEN.split('#')[1]),
        lastNameEN :removeJunk( data.fullNameEN.split('#')[3]),
        titleTH :removeJunk( data.fullNameTH.split('#')[0]),
        firstNameTH : removeJunk( data.fullNameTH.split('#')[1]),
        lastNameTH : removeJunk( data.fullNameTH.split('#')[3]),
        dateOfBirth: data.dateOfBirth,
        gender: ((data as any).gender === '1') ?  'male' : 'female',
        cardIssuer: removeJunk(data.cardIssuer),
        issueDate: removeJunk(data.issueDate),
        expireDate: removeJunk(data.expireDate),
        address: removeJunk(data.address),
        photoAsBase64Uri: 'data:image/jpeg;base64,'+data.photoAsBase64Uri
      }
      callBack(result)
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

      reader.on("status", async function (status) {
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
            await delay(that.insertCardDelay)
            reader.connect(
              { share_mode: this.SCARD_SHARE_SHARED },
              async function (err, protocol) {
                if (err) {
                  console.log(err)
                } else {
                  console.log("Protocol(", reader.name, "):", protocol)

                  const sendRawCommand = async (data: number[]): Promise<Buffer> => {
                    return new Promise((resolve, reject) => {
                      
                      reader.transmit(
                        Buffer.from(data),
                        data[data.length-1]+2,
                        protocol,
                        function (err, data) {
                          if (err) {
                            reader.disconnect(()=>{
                              console.log('transmit error : disconnect')
                            })
                             console.log(err)
                          }
                          else {

                            resolve(data)
                            setTimeout(()=>{
                              reject()
                            },that.readTimeout)
                          }
                        }
                      )
                    })
                  }

                  await sendRawCommand(apdu.select)
                  const getData = async (command: number[]) => {
                    let temp = await sendRawCommand(command)
                    let result = await sendRawCommand([
                      ...apdu.getResponse,
                      temp[1],
                    ])
                    result = result.slice(0, -2)
                    // console.log(legacy.decode(result, "tis620"))
                    return legacy.decode(result, "tis620")
                  }
                  const getPhoto = async (command: number[]) => {
                    let temp = await sendRawCommand(command)
                    let result = await sendRawCommand([
                      ...apdu.getResponse,
                      temp[1],
                    ])
                    result = result.slice(0, -2)
                    return result
                  }
                  let data: Partial<SmartCardReturnData> = {}
                  data.citizenID = await getData(apdu.citizenID)
                  data.fullNameTH = await getData(apdu.fullNameTH)
                  data.fullNameEN = await getData(apdu.fullNameEN)
                  data.gender = await getData(apdu.gender)
                  data.cardIssuer =await getData(apdu.cardIssuer)
                  data.dateOfBirth = moment(await getData(apdu.dateOfBirth),'YYYYMMDD').add(-543,'years').format('YYYY-MM-DD')
                  data.issueDate = moment(await getData(apdu.issueDate),'YYYYMMDD').add(-543,'years').format('YYYY-MM-DD')
                  data.expireDate = moment(await getData(apdu.expireDate),'YYYYMMDD').add(-543,'years').format('YYYY-MM-DD')
                  data.address = await getData(apdu.address)
                  let photo: Buffer = Buffer.from([])
                  for (let row of apdu.photos) {
                    let tempPhoto = await getPhoto(row)
                    photo = Buffer.concat([photo, tempPhoto])
                  }
                  const content = photo
                  // console.log(content)
                  data.photoAsBase64Uri = content.toString("base64")
                  // fs.writeFileSync("test.jpg", content, "base64")
                  that.eventEmitter.emit("READ_COMPLETE", data)
                  reader.disconnect(()=>{
                    console.log('read complete disconnect')
                  })
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

function removeJunk(str : string) {
let temp = str
temp = temp.replace(/#/g,' ')
temp = temp.replace(/\s{2,}/g, ' ');
if(temp[temp.length-1] === ' ')
temp =temp.slice(0,-1)
return temp
}
function delay(timeout : number) {
  return new Promise((resolve,reject)=>{
    setTimeout(() => {
      resolve(true)
    }, timeout);
  })
}

