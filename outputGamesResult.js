'use strict'

function printOutputString (output) {
  return console.log(output)
}

function toOutputString ({
  gameName,
  weightedScore,
  grossScore,
  count,
  scores,
  scoreStandardDeviation
}) {
  return [
    gameName,
    weightedScore,
    grossScore,
    count,
    scores.join(', '),
    scoreStandardDeviation
  ].join('\t')
}

module.exports = {
  printOutputString,
  toOutputString
}
