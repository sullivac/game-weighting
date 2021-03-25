'use strict'

const { google } = require('googleapis')

function initializeSheetsOptions (spreadsheetId, options) {
  return { spreadsheetId, ...options }
}

const spreadsheetId = '18ZFWy1_79ikecTjFgWB-mWVNBsX_e8Y8-FZsB4aTPVM'
const getValuesOptions = initializeSheetsOptions(spreadsheetId, {
  range: 'Preferences',
  majorDimension: 'COLUMNS'
})
const clearValuesOptions = initializeSheetsOptions(spreadsheetId, {
  range: 'Rankings'
})
const updateValuesOptions = initializeSheetsOptions(spreadsheetId, {
  range: 'Rankings',
  valueInputOption: 'RAW'
})

function initializeGoogleSheetsApi (auth) {
  return google.sheets({ version: 'v4', auth }).spreadsheets.values
}

function getValues (spreadsheetsValues) {
  return function () {
    spreadsheetsValues
      .get(getValuesOptions)
      .then(({ data: { values } }) => values)
  }
}

function updateValues (spreadsheetsValues) {
  return function (values) {
    spreadsheetsValues.clear(clearValuesOptions).then(() => {
      spreadsheetsValues.update({
        ...updateValuesOptions,
        requestBody: { values }
      })
    })
  }
}

module.exports = {
  initializeGoogleSheetsApi,
  getValues,
  updateValues
}
