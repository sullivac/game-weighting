'use strict'

const fs = require('fs')
const util = require('util')

function byDescending (left, right) {
  return right - left
}

function byWeightedScoreThenOccurrencesThenGrossScore (left, right) {
  const weightedResult = byDescending(left.weightedScore, right.weightedScore)

  if (!weightedResult) {
    const occurrenceResult = byDescending(left.count, right.count)

    if (!occurrenceResult) {
      return byDescending(left.grossScore, right.grossScore)
    }

    return occurrenceResult
  }

  return weightedResult
}

function ensureGameEntry (gameEntries, gameMap, gameName) {
  if (gameMap.has(gameName)) {
    return gameMap.get(gameName)
  }

  const result = {
    gameName,
    scores: [],
    weightedScores: []
  }

  gameMap.set(gameName, result)
  gameEntries[gameEntries.length] = result

  return result
}

function printOutputString (output) {
  return console.log(output)
}

function toGameResult ({ gameName, scores, weightedScores }) {
  return {
    gameName,
    count: scores.length,
    scores: scores.sort(byDescending),
    weightedScore: weightedScores.reduce(toSum, 0),
    grossScore: scores.reduce(toSum, 0)
  }
}

function toMax (accumulator, operator) {
  return Math.max(accumulator, operator)
}

function toNormalizedGameName (gameName) {
  return gameName.replace(/ \([\d\w+]*\)/, '')
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

function toSum (accumulator, operator) {
  return accumulator + operator
}

const readFile = util.promisify(fs.readFile)

readFile(process.argv[2])
  .then(data => {
    function toGameEntry () {
      const gameMap = new Map()

      return function (accumulator, { gameName, score, weightedScore }) {
        const { scores, weightedScores } = ensureGameEntry(
          accumulator,
          gameMap,
          gameName
        )

        scores.push(score)
        weightedScores.push(weightedScore)

        return accumulator
      }
    }

    function toPlayerGame (longestGameListLength, playerCount) {
      return function (gameName, index) {
        const score = longestGameListLength - index

        return {
          gameName: toNormalizedGameName(gameName),
          score,
          weightedScore: score / playerCount
        }
      }
    }

    function toPlayerGames (toPlayerGame) {
      return function (player) {
        return player.games.map(toPlayerGame)
      }
    }

    const players = JSON.parse(data)

    const longestGameListLength = players
      .map(player => player.games.length)
      .reduce(toMax, 0)

    const playerCount = players.length

    players
      .flatMap(toPlayerGames(toPlayerGame(longestGameListLength, playerCount)))
      .reduce(toGameEntry(), [])
      .map(toGameResult)
      .sort(byWeightedScoreThenOccurrencesThenGrossScore)
      .map(toOutputString)
      .forEach(printOutputString)
  })
  .catch(console.error.bind(console))
