'use strict'

const { google } = require('googleapis')
const path = require('path')
const readline = require('readline')
const { writeFile } = require('fs/promises')

const { readJsonFile } = require('./readJsonFile')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const oAuth2TokenPath = path.join(process.env.HOME, '.googleapis', 'token.json')
const oAuth2ClientCredentialsPath = path.join(
  process.env.HOME,
  '.googleapis',
  'credentials.json'
)

function setCredentialsOnClient (oAuth2Client) {
  return function (credentials) {
    oAuth2Client.setCredentials(credentials)

    return oAuth2Client
  }
}

function question (query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve =>
    rl.question(query, answer => {
      rl.close()
      resolve(answer)
    })
  )
}

function requestOAuth2Tokens (oAuth2Client) {
  return function () {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })

    console.log('Authorize this app by visiting this url:', authUrl)

    return question('Enter the code from that page here: ')
      .then(code => oAuth2Client.getToken(code))
      .then(({ tokens }) => {
        setCredentialsOnClient(tokens)

        return writeFile(oAuth2TokenPath, JSON.stringify(tokens))
      })
  }
}

function initializeGoogleOAuth2Client (useOAuth2Client) {
  return readJsonFile(oAuth2ClientCredentialsPath, data => data.installed)
    .then(
      ({
        client_secret: clientSecret,
        client_id: clientId,
        redirect_uris: redirectUris
      }) => {
        const oAuth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret,
          redirectUris[0]
        )

        return readJsonFile(oAuth2TokenPath)
          .then(setCredentialsOnClient(oAuth2Client))
          .catch(requestOAuth2Tokens(oAuth2Client))
      }
    )
    .then(useOAuth2Client)
}

module.exports = { initializeGoogleOAuth2Client }
