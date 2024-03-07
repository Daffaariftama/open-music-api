const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsongsService{
	constructor(){
		this._pool = new Pool();
	}

	async addPlaylistsong({playlistId, songId}){
		try{

			const id = `playlist-${nanoid(16)}`;

			const query = {
				text: 'INSERT INTO playlistsongs VALUES($1,$2,$3) RETURNING id',
				values: [id, playlistId, songId],
			};
			
			console.log('Executing query:', query.text, 'with values:', query.values);
			const result = await this._pool.query(query);
			return result.rows[0].id;

		}catch(error){
			throw new NotFoundError("Playlist tidak ditemukan");
		}
		
		
	}

	async getPlaylistsongById(id) {
		const query = {
		  text: `SELECT
			playlists.id,
			playlists.name,
			users.username,
			json_agg(json_build_object(
				'id', songs.id,
				'title', songs.title,
				'performer', songs.performer
			)) AS songs
		FROM
			playlists
		JOIN
			playlistsongs ON playlists.id = playlistsongs.playlist_id
		JOIN
			users ON playlists.owner = users.id
		JOIN
			songs ON playlistsongs.song_id = songs.id
		WHERE
			playlists.id = $1
		GROUP BY
			playlists.id, playlists.name, playlists.owner, users.username;
		`,
		  values: [id],
		};
		const result = await this._pool.query(query);
	
		if (!result.rows.length) {
		  throw new NotFoundError("Playlist tidak ditemukan");
		}
	
		return result.rows[0];
	}

	async deletePlaylistsong(songId, playlistId) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING id",
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Lagu gagal dihapus");
    }
  }
}

module.exports = PlaylistsongsService;