'use strict'

const identity = require('./identity')

const { descending, byAscending, byDescending } = require('./sorting')

function toMax (accumulator, operator) {
  return Math.max(accumulator, operator)
}

function normalizeGameName (gameName) {
  return gameName.replace(/ \([\d\w+]*\)/, '')
}

function toUniqueGames () {
  const gameSet = new Set()

  function addGame (accumulator, gameName) {
    gameSet.add(gameName)
    accumulator.push(gameName)

    return accumulator
  }

  return function (accumulator, gameName) {
    return gameSet.has(gameName)
      ? identity(accumulator)
      : addGame(accumulator, gameName)
  }
}

function toNormalizedGames (player) {
  return { games: player.games.map(normalizeGameName).reduce(toUniqueGames(), []) }
}

function toIndexedGame ({ games }) {
  return games.map((gameName, index) => ({ gameName, index }))
}

function toScoredGame (longestGameListLength, playerCount) {
  return function ({ gameName, index }) {
    const score = longestGameListLength - index

    return {
      gameName,
      score,
      weightedScore: score / playerCount
    }
  }
}

function getGameEntry (gameEntries, gameMap, gameName) {
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

function toGameEntry () {
  const gameMap = new Map()

  return function (accumulator, { gameName, score, weightedScore }) {
    const { scores, weightedScores } = getGameEntry(
      accumulator,
      gameMap,
      gameName
    )

    scores.push(score)
    weightedScores.push(weightedScore)

    return accumulator
  }
}

function toSum (accumulator, operator) {
  return accumulator + operator
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

const byWeightedScoreDescending = byDescending(
  ({ weightedScore }) => weightedScore
)
const byPlayerCountDescending = byDescending(({ count }) => count)
const byStandardDeviation = byAscending(
  ({ scoreStandardDeviation }) => scoreStandardDeviation
)

function processGames (players) {
  const longestGameListLength = players
    .map(player => player.games.length)
    .reduce(toMax, 0)

  const playerCount = players.length

  return players
    .map(toNormalizedGames)
    .flatMap(toIndexedGame)
    .map(toScoredGame(longestGameListLength, playerCount), [])
    .reduce(toGameEntry(), [])
    .map(toGameResult(playerCount))
    .sort(
      byWeightedScoreDescending
        .then(byPlayerCountDescending)
        .then(byStandardDeviation)
    )
}

module.exports = { processGames }
