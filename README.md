# Thai ID Card Reader

Node.js library สำหรับอ่านข้อมูลจากบัตรประชาชนไทยผ่าน smart card reader ที่รองรับ PC/SC

## Requirements

- Node.js `20.x`
- Smart card reader ที่ระบบมองเห็นผ่าน PC/SC
- บัตรประชาชนไทย

### macOS

- ติดตั้ง Xcode หรือ Command Line Tools
- ถ้า `git`, `clang` หรือ native module ใช้งานไม่ได้ ให้ตรวจด้วย:

```bash
xcode-select -p
git --version
clang --version
```

### Windows 11

- ติดตั้ง Node.js `20.x`
- ติดตั้ง Visual Studio Build Tools พร้อม C++ build tools
- ถ้า `npm install` ติดตอน build `pcsclite` ให้ตรวจ environment ฝั่ง build tools ก่อน

## Install

ติดตั้ง package:

```bash
npm install thai-id-card-reader
```

ถ้าเพิ่งเปลี่ยน Node version หรือ native module ยังไม่ถูก build ให้รัน:

```bash
npm rebuild pcsclite
```

## Public API

package นี้ export:

- `ThaiIdCardReader`
- `sendCardData`
- type `ThaiIdCardReaderOptions`
- type `SmartCardReturnData`
- type `CardDataPayload`
- type `SendCardDataOptions`

## Usage

```ts
import { ThaiIdCardReader } from "thai-id-card-reader"

const reader = new ThaiIdCardReader({
  insertCardDelay: 500,
  readTimeout: 5000,
})

reader.onReadComplete((data) => {
  console.log("Card read complete", data)
})

reader.onReadError((error) => {
  console.error("Thai ID card read error", error)
})

reader.init()
```

`ThaiIdCardReaderOptions`

- `insertCardDelay`: หน่วงเวลาก่อนเริ่มอ่านหลังเสียบบัตร หน่วยเป็น milliseconds ค่า default คือ `2000`
- `readTimeout`: timeout ต่อการส่งคำสั่งไปยังบัตร หน่วยเป็น milliseconds ค่า default คือ `0`

หมายเหตุ:

- ถ้าตั้ง `readTimeout` เป็น `0` จะปิด timeout
- หลังสร้าง instance แล้ว สามารถเปลี่ยนค่า runtime ได้ด้วย `setInsertCardDelay(timeout)` และ `setReadTimeout(timeout)`

## Events

### `onReadComplete`

callback จะได้รับข้อมูลที่ผ่านการ normalize แล้วในรูปแบบ `Partial<SmartCardReturnData>`

```ts
reader.onReadComplete((data) => {
  console.log(data.citizenID)
  console.log(data.fullNameTH)
})
```

### `onReadError`

callback จะได้รับ error message เป็น `string`

```ts
reader.onReadError((error) => {
  console.error(error)
})
```

## Data Shape

ข้อมูลที่ normalize แล้วมี field ดังนี้:

| key | type |
| --- | --- |
| `citizenID` | `string` |
| `titleTH` | `string` |
| `titleEN` | `string` |
| `fullNameTH` | `string` |
| `fullNameEN` | `string` |
| `firstNameTH` | `string` |
| `firstNameEN` | `string` |
| `lastNameTH` | `string` |
| `lastNameEN` | `string` |
| `dateOfBirth` | `string` |
| `gender` | `"male" \| "female"` |
| `cardIssuer` | `string` |
| `issueDate` | `string` |
| `expireDate` | `string` |
| `address` | `string` |
| `photoAsBase64Uri` | `string` |

หมายเหตุ:

- `fullNameTH` และ `fullNameEN` จะถูกลบ separator และจัด spacing ให้พร้อมใช้งาน
- `photoAsBase64Uri` จะอยู่ในรูปแบบ data URI เช่น `data:image/jpeg;base64,...`
- callback ของ `onReadComplete` รับค่าแบบ `Partial<SmartCardReturnData>` เพราะบาง field อาจไม่มีค่าจากการอ่านจริง

ตัวอย่างข้อมูล:

```json
{
  "citizenID": "1234567890123",
  "titleTH": "นาย",
  "titleEN": "MR.",
  "fullNameTH": "นาย ตัวอย่าง ใจดี",
  "fullNameEN": "MR. EXAMPLE JAIDEE",
  "firstNameTH": "ตัวอย่าง",
  "firstNameEN": "EXAMPLE",
  "lastNameTH": "ใจดี",
  "lastNameEN": "JAIDEE",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "cardIssuer": "Some District Office",
  "issueDate": "2020-01-01",
  "expireDate": "2030-01-01",
  "address": "Bangkok",
  "photoAsBase64Uri": "data:image/jpeg;base64,..."
}
```

## Send Data To API

helper `sendCardData` ใช้ส่งข้อมูลไปยัง server ด้วย HTTP `POST`

```ts
import { sendCardData } from "thai-id-card-reader"

await sendCardData(cardData, {
  url: "https://your-api.example.com/api/smartcard-reader/v1",
})
```

request ที่ส่งออก:

- Method: `POST`
- URL: ค่าจาก `options.url`
- Content-Type: `application/json`
- Body: `{ data: cardData }`

ตัวอย่างใช้งานร่วมกับ reader:

```ts
import { ThaiIdCardReader, sendCardData } from "thai-id-card-reader"

const reader = new ThaiIdCardReader({
  insertCardDelay: 500,
  readTimeout: 5000,
})

reader.onReadComplete(async (data) => {
  const response = await sendCardData(data, {
    url: "https://your-api.example.com/api/smartcard-reader/v1",
  })

  console.log(response)
})

reader.init()
```

หมายเหตุ:

- `sendCardData` จะ throw ถ้า `url` ว่างหรือไม่ใช่ URL ที่ parse ได้
- ถ้า server ตอบกลับด้วย error จาก `axios` function นี้จะ throw message ที่รวม status code และ response body เท่าที่มี

## Demo In This Repo

repo นี้มี demo script ที่ [src/demo.ts](/Users/tinsittiyot/Desktop/MyProject/runmyroom/thai-id-card-reader/src/demo.ts) ใช้ทดสอบการอ่านบัตรและส่งข้อมูลต่อไปยัง API

ติดตั้ง dependency:

```bash
npm install
```

รัน demo:

```bash
source ~/.nvm/nvm.sh
nvm use 20
export THAI_ID_CARD_API_URL="https://your-api.example.com/api/smartcard-reader/v1"
npm start
```

พฤติกรรมของ demo:

1. สร้าง `ThaiIdCardReader` ด้วย `insertCardDelay: 500` และ `readTimeout: 5000`
2. เริ่มฟัง event จาก smart card reader
3. เมื่ออ่านบัตรสำเร็จ จะ log ข้อมูลที่ normalize แล้ว
4. ถ้ามี `THAI_ID_CARD_API_URL` จะเรียก `sendCardData`
5. ถ้าไม่ได้ตั้ง `THAI_ID_CARD_API_URL` จะข้ามขั้นตอนส่ง API

## Troubleshooting

### `This project requires Node 20.x`

กำลังใช้ Node คนละเวอร์ชันกับที่โปรเจกต์ต้องการ

```bash
source ~/.nvm/nvm.sh
nvm use 20
node -v
```

### `Could not locate the bindings file` for `pcsclite`

native module ยังไม่ถูก build สำหรับ environment ปัจจุบัน

```bash
npm rebuild pcsclite
```

ถ้ายังไม่ผ่าน ให้เช็กว่าเครื่องมี build tools ครบ

### `SCardEstablishContext error: Service not available.(0x8010001d)`

ระบบยังไม่พร้อมใช้งาน PC/SC service หรือยังไม่เห็น reader ในระดับ smart card subsystem

สิ่งที่ควรเช็ก:

- ถอด reader แล้วเสียบใหม่
- ปิดและเปิด terminal ใหม่
- บน macOS ให้เช็ก `System Information` > `SmartCards`

### `Smart card read timeout`

reader ตอบช้ากว่าค่าที่กำหนดไว้ใน `readTimeout`

แนวทางแก้:

- เพิ่ม `readTimeout`
- เพิ่ม `insertCardDelay`
- ถ้าต้องการปิด timeout ชั่วคราว ให้ตั้ง `readTimeout` เป็น `0`

### `SCardTransmit error: Transaction failed.(0x80100016)`

มักเกี่ยวกับ reader/card transaction ที่ไม่สมบูรณ์ หรือสภาวะ reader ยังไม่พร้อม

แนวทางแก้:

- ถอดและเสียบบัตรใหม่
- ถอดและเสียบ reader ใหม่
- ปิดโปรแกรมแล้วรันใหม่
- ตรวจว่าค่า delay/timeout ที่ตั้งไว้ไม่สั้นเกินไป

## Notes

- โปรเจกต์นี้พึ่ง `pcsclite` ซึ่งเป็น native module
- การย้ายเครื่อง เปลี่ยน Node version หรือเปลี่ยน OS อาจต้อง `npm rebuild pcsclite` ใหม่
