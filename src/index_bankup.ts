import sendToServer from "./sendToServer"
const childProcess = require("child_process")

run()
function run() {
  const {
    ThaiCardReader,
    EVENTS,
    MODE,
  } = require("@privageapp/thai-national-id-reader")
  const reader = new ThaiCardReader()
  reader.readMode = MODE.PERSONAL_PHOTO
  reader.autoRecreate = true
  reader.startListener()

  reader.on(EVENTS, async (obj: any) => {
    beep()
    console.log(obj)
    await sendToServer(obj)
  })
  reader.on(EVENTS.READING_COMPLETE, async (obj: any) => {
    beep()
    console.log(obj)
    await sendToServer(obj)
  })
}
function beep() {
  // Winndows code
  childProcess.exec("powershell.exe [console]::beep(500,1200)")
  // MACOS code
  childProcess.exec("afplay /System/Library/Sounds/Glass.aiff")
}
