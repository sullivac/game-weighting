'use strict'

function ascending (left, right) {
  return left - right
}

function descending (left, right) {
  return ascending(right, left)
}

function thenBy (next) {
  const parent = this

  return applyThen(function sort (left, right) {
    return parent(left, right) || next(left, right)
  })
}

function sorter (direction) {
  return function (selectPropertyOf) {
    return applyThen(function sort (left, right) {
      return direction(selectPropertyOf(left), selectPropertyOf(right))
    })
  }
}

function applyThen (sort) {
  sort.then = thenBy

  return sort
}

module.exports = {
  descending,
  byAscending: sorter(ascending),
  byDescending: sorter(descending)
}
