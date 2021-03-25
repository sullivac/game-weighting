'use strict'

const { google } = require('googleapis')
const path = require('path')
const readline = require('readline')
const { rm, writeFile } = require('fs/promises')

const { readJsonFile } = require('./readJsonFile')

const scope = ['https://www.googleapis.com/auth/spreadsheets']

const oAuth2TokenPath = path.join(process.env.HOME, '.googleapis', 'token.json')
const oAuth2ClientCredentialsPath = path.join(
  process.env.HOME,
  '.googleapis',
  'credentials.json'
)

function initializeOAuth2Client ({
  installed: {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: redirectUris
  }
}) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUris[0])
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

function requestOAuth2Tokens (oAuth2Client, setCredentialsOnClient) {
  return function () {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope
    })

    console.log('Authorize this app by visiting this url:', authUrl)

    return question('Enter the code from that page here: ')
      .then(code => oAuth2Client.getToken(code))
      .then(writeToken(setCredentialsOnClient))
  }
}

function setCredentials (oAuth2Client) {
  return function (credentials) {
    oAuth2Client.setCredentials(credentials)

    return oAuth2Client
  }
}

function writeToken (setCredentialsOnClient) {
  return function ({ tokens }) {
    return writeFile(oAuth2TokenPath, JSON.stringify(tokens)).then(() =>
      setCredentialsOnClient(tokens)
    )
  }
}

function initializeGoogleOAuth2Client (useOAuth2Client) {
  return readJsonFile(oAuth2ClientCredentialsPath, initializeOAuth2Client)
    .then(oAuth2Client => {
      const setCredentialsOnClient = setCredentials(oAuth2Client)

      return readJsonFile(oAuth2TokenPath)
        .then(setCredentialsOnClient)
        .catch(requestOAuth2Tokens(oAuth2Client, setCredentialsOnClient))
    })
    .then(useOAuth2Client)
}

function removeToken () {
  return rm(oAuth2TokenPath)
}

module.exports = {
  initializeGoogleOAuth2Client,
  removeToken
}
