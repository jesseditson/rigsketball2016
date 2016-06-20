
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.increments()
      table.timestamps()
      table.string('email')
      table.string('password')
    }),
    knex.schema.createTable('bands', table => {
      table.increments()
      table.timestamps()
      table.string('name')
      table.string('website')
      table.string('bandcamp')
      table.string('soundcloud')
      table.string('phone')
      table.string('email')
      table.string('address')
      table.string('member_count')
      table.string('trackURL')
      table.string('imageURL')
    }),
    knex.schema.createTable('rounds', table => {
      table.increments()
      table.timestamps()
      table.string('title')
      table.integer('index')
    }),
    knex.schema.createTable('matches', table => {
      table.increments()
      table.timestamps()
      table.integer('index')
      table.string('location')
      table.timestamp('time')
      table.integer('round_id')
      table.foreign('round_id').references('id').inTable('rounds')
      table.integer('band1_id')
      table.integer('band2_id')
      table.foreign('band1_id').references('id').inTable('bands')
      table.foreign('band2_id').references('id').inTable('bands')
      table.integer('band1_score')
      table.integer('band2_score')
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('bands'),
    knex.schema.dropTable('rounds'),
    knex.schema.dropTable('matches')
  ])
};
