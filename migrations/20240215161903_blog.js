// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.up = function(knex) {
//     return knex.schema.createTable('blog', (table) => {
//         table.increments(),
//         table.string('slug'),
//         table.string('title')
//         table.text('description'),
//         table.text('location')
//       })
// };

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.down = function(knex) {
//     return knex.schema.dropTable('blog')
// };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
      .createTable('blogs', (table) => {
        table.increments('id').primary(),
        table.string('slug', 255),
        table.string('title', 255),
        table.text('description'),
        table.text('location'),
        table.string('image', 255),
        table.integer('user_id'),
        table.dateTime('created_at').defaultTo(knex.fn.now()),
        table.dateTime('deleted_at'),
        table.enum('is_published', ['Y', 'N']).defaultTo('N')
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
      .dropTable('blogs');
};

