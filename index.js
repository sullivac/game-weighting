'use strict'

const { initializeGoogleOAuth2Client, removeToken } = require('./googleOAuth2')
const {
  initializeGoogleSheetsApi,
  getValues,
  updateValues
} = require('./googleSheets')
const { transformSheetData } = require('./transformSheetData')
const { processGames } = require('./processGames')
const { mapRankingsData } = require('./rankings')

function refreshToken (retry) {
  return function () {
    return removeToken().then(retry)
  }
}

function tokenError (handleTokenFailure) {
  return function (error) {
    if (error.response) {
      const {
        response: {
          config: { url },
          status
        }
      } = error

      if (
        url === 'https://oauth2.googleapis.com/token' &&
        (status === 400 || status === 401)
      ) {
        return handleTokenFailure
      }
    }

    throw error
  }
}

const tokenErrorAndRetry = tokenError(refreshToken(start))

function generateGameRankings (spreadsheetsValues) {
  const getSpreadsheetValues = getValues(spreadsheetsValues)
  const writeSpreadsheetValues = updateValues(spreadsheetsValues)

  return getSpreadsheetValues()
    .catch(tokenErrorAndRetry)
    .then(transformSheetData)
    .then(processGames)
    .then(mapRankingsData)
    .then(writeSpreadsheetValues)
}

function start () {
  return initializeGoogleOAuth2Client(initializeGoogleSheetsApi).then(
    generateGameRankings
  )
}

start().catch(console.error)
