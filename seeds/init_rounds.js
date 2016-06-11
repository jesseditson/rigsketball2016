var Promise = require('bluebird')

const titleMap = {
  32: 'Round of 32',
  16: 'Sweet 16',
  8: 'Elite Eight',
  4: 'Final Four',
  2: 'Finals'
}

exports.seed = function(knex) {
  return Promise.all([
    knex('rounds').del(),
    knex('matches').del()
  ]).then(() => {
    var operations = []

    var currentRound = 32
    while (currentRound > 1) {
      operations.push(createRound(knex, currentRound))
      currentRound = currentRound / 2
    }
    return Promise.each(operations, function() {
      console.log('done')
    })
  })
};

function createRound(knex, currentRound) {
  return knex('rounds')
    .insert({
      index: currentRound,
      title: titleMap[currentRound] || `Round of ${currentRound}`
    })
    .returning('id')
    .then(records => {
      var round = records[0]
      var ops = []
      var index = 0
      for (var i = 0; i < currentRound; i+=2) {
        ops.push(
          knex('matches')
            .insert({
              index: ++index,
              round_id: round
            })
        )
      }
      return Promise.all(ops)
    })
}
