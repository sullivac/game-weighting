'use strict'

const { descending, byAscending, byDescending } = require('./sorting')

const byWeightedScoreDescending = byDescending(
  ({ weightedScore }) => weightedScore
)
const byPlayerCountDescending = byDescending(({ count }) => count)
const byStandardDeviation = byAscending(
  ({ scoreStandardDeviation }) => scoreStandardDeviation
)

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

function toGameResult (playerCount) {
  return function ({ gameName, scores, weightedScores }) {
    const weightedScore = weightedScores.reduce(toSum, 0)

    return {
      gameName,
      count: scores.length,
      scores: scores.slice().sort(descending),
      weightedScore,
      grossScore: scores.reduce(toSum, 0),
      scoreStandardDeviation: Math.sqrt(
        (scores
          .map(score => Math.pow(score - weightedScore, 2))
          .reduce(toSum, 0) +
          (playerCount - scores.length) * Math.pow(weightedScore, 2)) /
          playerCount
      )
    }
  }
}

function toMax (accumulator, operator) {
  return Math.max(accumulator, operator)
}

function toNormalizedGameName (gameName) {
  return gameName.replace(/ \([\d\w+]*\)/, '')
}

function toSum (accumulator, operator) {
  return accumulator + operator
}

function processGames (players) {
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

  const longestGameListLength = players
    .map(player => player.games.length)
    .reduce(toMax, 0)

  const playerCount = players.length

  return players
    .flatMap(toPlayerGames(toPlayerGame(longestGameListLength, playerCount)))
    .reduce(toGameEntry(), [])
    .map(toGameResult(playerCount))
    .sort(
      byWeightedScoreDescending
        .then(byPlayerCountDescending)
        .then(byStandardDeviation)
    )
}

module.exports = { processGames }
