'use strict'

function transformSheetData (columns) {
  const players = columns.map(column =>
    column.reduce(
      (accumulator, cell, index) => {
        if (index) {
          const { games } = accumulator
          games.push(cell)
        } else {
          accumulator.name = cell
        }

        return accumulator
      },
      { name: '', games: [] }
    )
  )

  return {
    and: function (mapper) {
      return mapper(players)
    }
  }
}

module.exports = {
  transformSheetData
}
