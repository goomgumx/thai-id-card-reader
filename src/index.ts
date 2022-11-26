import ThaiIDCardReader from "./ThaiIDCardReader"
run()
function run() {
  const reader = new ThaiIDCardReader()
  reader.init()
  // setInsertCardDelay : if run on windows set it to 1000 or try more than 1000 if it error 
  // macOS set to 0
  reader.setInsertCardDelay(1000) 
  // if run on macOS you can remove function setReadTimeout below
  // if you run on windows and it stuck. didn't get any data. try to increase timeout value
  reader.setReadTimeout(10) 
  reader.onReadComplete((data) => {
    console.log(data)
  })
  reader.onReadError((error) => {
    console.log(error)
  })
}
