/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
      id: {
          type: 'varchar(30)',
          primaryKey: true,
      },
      user_id: {
          type: 'varchar(30)',
          references: '"users"',
          onDelete: 'cascade',
          onUpdate: 'cascade',
      },
      album_id: {
          type: 'varchar(30)',
          references: '"albums"',
          onDelete: 'cascade',
          onUpdate: 'cascade',
      },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};