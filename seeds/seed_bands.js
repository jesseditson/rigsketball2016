
exports.seed = function(knex, Promise) {
  return knex('bands')
    .del()
    .then(() => {
      return knex('rounds')
        .select('index', 'id')
        .then(rounds => {
          var roundNum = 0
          var roundId
          rounds.forEach(r => {
            if (r.index > roundNum) {
              roundNum = r.index
              roundId = r.id
            }
          })
          return knex('matches')
            .select('*')
            .where('round_id', roundId)
        })
        .then(matches => {
          var ops = matches.map(m => {
            return knex('bands')
              .insert([{ name: 'TBD' }, { name: 'TBD' }], 'id')
              .then(records => {
                console.log('new bands: ', records)
                if (records.length === 1) {
                  // if only one is provided, it's the last ID
                  records[1] = records[0]
                  records[0] = records[1] - 1
                }
                return knex('matches')
                  .update({
                    band1_id: records[0],
                    band2_id: records[1]
                  })
                  .where({ id: m.id })
              })
          })
          return Promise.all(ops)
        })
    })
};
