'use strict'

function ascending (left, right) {
  return left - right
}

function descending (left, right) {
  return ascending(right, left)
}

function thenBy (next) {
  const parent = this

  function sort (left, right) {
    const parentResult = parent(left, right)

    return parentResult ? parentResult : next(left, right)
  }

  sort.then = thenBy

  return sort
}

function sorter (direction) {
  return function (selectPropertyOf) {
    function sort (left, right) {
      return direction(selectPropertyOf(left), selectPropertyOf(right))
    }

    sort.then = thenBy

    return sort
  }
}

module.exports = {
  descending,
  byAscending: sorter(ascending),
  byDescending: sorter(descending)
}
