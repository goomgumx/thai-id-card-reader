# Thai ID Card Reader

This package is used to read personal information from thai national id cards.
- tested on node v.16.17.0
- tested on macOS Monterey v.12.5.1
- tested on windows 11 v.21H2
- maybe work on linux. didn't test
### Install
```
npm i thai-id-card-reader
```

on windows : if you got error. you must to install window build tool first
```
npm install --global windows-build-tools@4.0.0
```
on windows : if you still got error. you must to install visual studio minimum version 2019 following link below 
https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2019

install following this answer on stackoverflow
https://stackoverflow.com/a/54136652/16455947


### Example code
```
import ThaiIDCardReader from "thai-id-card-reader"

const reader = new ThaiIDCardReader()
reader.init()
// macOS set to 0, windows set to 1000
reader.setInsertCardDelay(1000) 
// if run on macOS you can remove function setReadTimeout below
// if you run on windows and it stuck. didn't get any data. try to increase timeout value
reader.setReadTimeout(1) 
reader.onReadComplete((data) => {
  console.log(data)
})
reader.onReadError((error) => {
  console.log(error)
})

```

### Response object 
| keyName | type |  
| --- | --- |
| citizenID    | string |
| fullNameTH | string |
| fullNameEN | string |
| titleTH | string |
| titleEN | string |
| firstNameTH | string |
| firstNameEN | string |
| lastNameTH | string |
| lastNameEN | string |
| gender | string ('male' or 'female') |
| dateOfBirth | string (YYYY-MM-DD)|
| address | string |
| cardIssuer | string |
| issueDate | string (YYYY-MM-DD)|
| expireDate | string (YYYY-MM-DD)|
| photoAsBase64Uri | string |

