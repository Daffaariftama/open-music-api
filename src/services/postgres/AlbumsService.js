const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapDBToAlbumLike} = require('../../utils/index');


class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
		this._cacheService = cacheService;
  }

	async deleteAlbumLike(albumId, userId) {
		const query = {
				text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
				values: [albumId, userId],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length){
				throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
		}

		await this._cacheService.delete(`album:${albumId}`);
}

async getAlbumLike(albumId) {

		try {
				const result = await this._cacheService.get(`album:${albumId}`);
				return {result: JSON.parse(result), isCache: true};

		} catch (error) {
				const query = {
						text: 'SELECT COUNT(album_id) FROM user_album_likes WHERE album_id = $1',
						values: [albumId],
				};

				const result = await this._pool.query(query);

				const resultMapped = mapDBToAlbumLike(result.rows[0].count);

				await this._cacheService.set(`album:${albumId}`, JSON.stringify(resultMapped));

				return {result: resultMapped};
		}
}

async addAlbumLike(albumId, userId) {
		const id = 'albumLike-' + nanoid(16);

		const query = {
				text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
				values: [id, userId, albumId],
		};

		const result = await this._pool.query(query);

		if (!result.rows[0].id){
				throw new InvariantError('data album like tidak dapat ditambahkan');
		}
		
		await this._cacheService.delete(`album:${albumId}`);
}

async verifyExistUser(albumId, userId) {
		const query = {
				text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
				values: [albumId, userId],
		};

		const result = await this._pool.query(query);

		if (result.rows.length) {
				throw new InvariantError('Album Sudah disukai');
		}
}

	async addAlbum({name, year}){
		const id = nanoid(16);

		const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

		const result = await this._pool.query(query);

		if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
 
    return result.rows[0].id;
	}

	async getAlbum(){
		const result = await this._pool.query('SELECT * FROM albums');
		return result.rows
	}

	async getAlbumById(id){
		const query = {
			text: 'SELECT * FROM albums WHERE id = $1',
			values: [id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
      throw new NotFoundError('albums tidak ditemukan');
    }
 
    return result.rows[0];
	}

	async putAlbumById(id, {name, year}){
		const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

		const result = await this._pool.query(query);

		if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
	}

	async deleteAlbumById(id){
		const query = {
			text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
			values: [id]
		};

		const result = await this._pool.query(query);

		if (!result.rows.length) {
      throw new NotFoundError('album gagal dihapus. Id tidak ditemukan');
    }
	}

	async addCoverAlbum(id, coverUrl) {

		const query = {
				text: 'UPDATE albums SET cover = $1  WHERE id = $2 RETURNING id',
				values: [coverUrl, id],
		};

		const result = await this._pool.query(query);

		if (!result.rows.length){
				throw new NotFoundError('Gagal memperbaharui cover. Album tidak ditemukan');
		}
}
}

module.exports = AlbumsService;