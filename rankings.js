'use strict'

const columnSources = [
  { header: 'Name', name: 'gameName' },
  { header: 'Weighted Score', name: 'weightedScore' },
  { header: 'Gross Score', name: 'grossScore' },
  { header: 'Occurrences', name: 'count' },
  {
    header: 'Individual Scores',
    name: 'scores',
    transform: value => value.join(', ')
  },
  { header: 'Standard Deviation', name: 'scoreStandardDeviation' }
]

function addHeaders (accumulator, gameResult) {
  accumulator.push(columnSources.map(source => source.header))

  return addRanking(accumulator, gameResult)
}

function addRanking (accumulator, gameResult) {
  accumulator.push(
    columnSources.map(source => {
      const value = gameResult[source.name]

      return source.transform ? source.transform(value) : value
    })
  )

  return accumulator
}

function mapRankingsData (gameData) {
  return gameData.reduce(
    (accumulator, gameResult, index) =>
      index
        ? addRanking(accumulator, gameResult)
        : addHeaders(accumulator, gameResult),
    []
  )
}

module.exports = { mapRankingsData }
