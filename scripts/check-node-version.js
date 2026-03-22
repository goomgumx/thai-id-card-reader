const requiredMajorVersion = 20
const currentMajorVersion = Number(process.versions.node.split(".")[0])

if (currentMajorVersion !== requiredMajorVersion) {
  console.error(
    `This project requires Node ${requiredMajorVersion}.x. Current version: ${process.versions.node}`
  )
  console.error("Run `nvm use` or install Node 20 before starting the project.")
  process.exit(1)
}
