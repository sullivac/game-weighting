'use strict'

const { initializeGoogleOAuth2Client } = require('./googleOAuth2')
const {
  initializeGoogleSheetsApi,
  getValues,
  updateValues
} = require('./googleSheets')
const { transformSheetData } = require('./transformSheetData')
const { processGames } = require('./processGames')
const { mapRankingsData } = require('./rankings')

initializeGoogleOAuth2Client(initializeGoogleSheetsApi)
  .then(spreadsheetsValues =>
    getValues(spreadsheetsValues)
      .then(transformSheetData)
      .then(processGames)
      .then(mapRankingsData)
      .then(updateValues(spreadsheetsValues))
  )
  .catch(console.error)
