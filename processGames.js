'use strict'

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
    .map(toGameResult)
    .sort(byWeightedScoreThenOccurrencesThenGrossScore)
}

module.exports = { processGames }
