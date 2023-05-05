require('dotenv').config()
const path = require('path')
const fs = require('fs-extra')

const { EPISODES_FOLDER: folder } = process.env
const lastPlayedPath = './lastPlayed.json'
const first = process.argv.includes('-f')

const getAllFiles = function (dirPath) {
  const result = []
  const files = fs.readdirSync(dirPath)

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      result.push(...getAllFiles(dirPath + '/' + file))
    } else {
      result.push({ name: file, fullPath: path.join(__dirname, dirPath, '/', file) })
    }
  })

  return result
}

const fileList = getAllFiles(folder).sort((a, b) => a.fullPath - b.fullPath)

async function run () {
  if (!await fs.pathExists(lastPlayedPath)) {
    await fs.outputJSON(lastPlayedPath, {})
  }

  const lastPlayed = await fs.readJSON(lastPlayedPath)
  const nextIndex = lastPlayed.name
    ? (fileList.findIndex(file => file.name === lastPlayed.name) + (first ? 0 : 1))
    : 0
  const next = fileList[nextIndex]

  console.log(next.fullPath)

  await fs.writeJSON(lastPlayedPath, next)
}

run()
