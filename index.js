'use strict'

const fs = require('fs')
const util = require('util')

const { readSheet } = require('./readGoogleSheet')
const { transformSheetData } = require('./transformSheetData')
const { processGames } = require('./processGames')
const { printOutputString, toOutputString } = require('./outputGamesResult')

const readFile = util.promisify(fs.readFile)

readFile(process.argv[2])
  .then(optionsContent => readSheet(JSON.parse(optionsContent)))
  .then(columns =>
    transformSheetData(columns)
      .and(processGames)
      .map(toOutputString)
      .forEach(printOutputString)
  )
  .catch(console.error)
