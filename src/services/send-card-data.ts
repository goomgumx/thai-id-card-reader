import axios from "axios"

import type { SmartCardReturnData } from "../types/smart-card-return-data"

export type CardDataPayload = Partial<SmartCardReturnData>
export type SendCardDataOptions = {
  url: string
}

type ServerSuccessResponse = unknown

function getConfiguredUrl(options: SendCardDataOptions) {
  const url = options.url.trim()
  if (!url) {
    throw new Error(`Invalid server URL: ${String(options.url)}`)
  }

  try {
    new URL(url)
  } catch {
    throw new Error(`Invalid server URL: ${url}`)
  }

  return url
}

export default async function sendCardData(
  data: CardDataPayload,
  options: SendCardDataOptions
): Promise<ServerSuccessResponse> {
  const url = getConfiguredUrl(options)

  try {
    const result = await axios.post(url, { data })
    console.log("sendCardData success", result.status, result.data)
    return result.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const responseData = error.response?.data
      throw new Error(
        `sendCardData failed${status ? ` (${status})` : ""}: ${
          responseData ? JSON.stringify(responseData) : error.message
        }`
      )
    }

    throw error
  }
}
