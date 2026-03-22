import { ThaiIdCardReader, sendCardData } from "./index"

const API_URL = process.env.THAI_ID_CARD_API_URL ?? ""

run()

function run() {
  const reader = new ThaiIdCardReader({
    insertCardDelay: 500,
    readTimeout: 5000,
  })

  console.log("Reader config", {
    insertCardDelay: 500,
    readTimeout: 5000,
  })

  reader.init()
  reader.onReadComplete(async (data) => {
    console.log("Card read complete", data)

    if (!API_URL) {
      console.log("Skipping API request because THAI_ID_CARD_API_URL is not set")
      return
    }

    try {
      const response = await sendCardData(data, { url: API_URL })
      console.log("Server response", response)
    } catch (error) {
      console.error("Failed to send card data to server", error)
    }
  })
  reader.onReadError((error) => {
    console.error("Thai ID card read error", error)
  })
}
