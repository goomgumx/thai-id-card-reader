import axios from "axios"
import config from "../config.json"
interface cardData {
  citizenId: string
  titleTH: string
  firstNameTH: string
  lastNameTH: string
  titleEN: string
  firstNameEN: string
  lastNameEN: string
  birthday: string
  gender: string
  address: string
  issue: string
  expire: string
  photo: string
}
export default function sendToServer(data: cardData) {
  const url = config?.url
  if (!url) {
    console.log("invalid url :" + url)
    return null
  }
  axios
    .post(url, { data: data })
    .then((result) => {
      console.log("success", result.data)
    })
    .catch((error) => {
      console.log(error)
    })
}
