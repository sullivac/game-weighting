'use strict'

function addGame (accumulator, cell) {
  const { games } = accumulator
  games.push(cell)

  return accumulator
}

function setPlayer (accumulator, cell) {
  accumulator.name = cell

  return accumulator
}

function toGameData (column) {
  return column.reduce(
    (accumulator, cell, index) =>
      index ? addGame(accumulator, cell) : setPlayer(accumulator, cell),
    { name: '', games: [] }
  )
}

function transformSheetData (columns) {
  return columns.map(toGameData)
}

module.exports = { transformSheetData }
