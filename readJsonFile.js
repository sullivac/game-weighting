'use strict'

const { readFile } = require('fs/promises')

function parse (transform) {
  return function (content) {
    const data = JSON.parse(content)

    return transform ? transform(data) : data
  }
}

function readJsonFile (jsonPath, transform) {
  return readFile(jsonPath).then(parse(transform))
}

module.exports = { readJsonFile }
