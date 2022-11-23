import ThaiIDCardReader from "./ThaiIDCardReader"
run()
function run() {
  const reader = new ThaiIDCardReader()
  reader.init()
  reader.onReadComplete((data) => {
    console.log(data)
  })
  reader.onReadError((error) => {
    console.log(error)
  })
}
