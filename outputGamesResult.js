'use strict'

function printOutputString (output) {
  return console.log(output)
}

function toOutputString ({
  gameName,
  weightedScore,
  grossScore,
  count,
  scores
}) {
  return [gameName, weightedScore, grossScore, count, scores.join(', ')].join(
    '\t'
  )
}

module.exports = {
  printOutputString,
  toOutputString
}
