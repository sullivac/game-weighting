'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const { google } = require('googleapis')
const { sheets } = require('googleapis/build/src/apis/sheets')

const readFile = util.promisify(fs.readFile)

const apiKeyPath = path.join(process.env.HOME, '.googleapis', 'apiKey.json')

function getSheetsValues (options, auth) {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: 'v4', auth })

    sheets.spreadsheets.values.get(options, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

function readSheet (options) {
  return readFile(apiKeyPath)
    .then(apiKeyContent => {
      const { apiKey } = JSON.parse(apiKeyContent)

      return getSheetsValues(options, apiKey)
    })
    .then(({ data }) => data.values)
    .catch(console.error.bind(console))
}

module.exports = { readSheet }
