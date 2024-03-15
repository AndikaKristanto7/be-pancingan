/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('blog').del()
  let location = {lat:0,lng:0}
  await knex('blog').insert([
    {id: 1, slug: 'ini-adalah-contoh-blog',title:'Ini Adalah Contoh Blog',description:'Ini adalah description',location:JSON.stringify(location)}
  ]);
};
