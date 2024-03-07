const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler{
	constructor(albumsService, storageService, validator){
			this._albumsService = albumsService;
			this._storageService = storageService;
			this._validator = validator;

			this.postAlbumHandler = this.postAlbumHandler.bind(this);
			this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
			this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
			this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
			this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
			this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
			this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
			this.getAlbumLikeHandler = this.getAlbumLikeHandler.bind(this);

	}

	async postAlbumHandler(request, h) {

			this._validator.validateAlbumPayload(request.payload);
			const {name, year} = request.payload;	
			const albumId = await this._albumsService.addAlbum({name, year});

			const response = h.response({
				status : "success",
				data : {
					albumId,
				},
			});
			response.code(201);
			return response

	}

	async getAlbumByIdHandler(request, h){

			const {id} = request.params;
			const album = await this._albumsService.getAlbumById(id);
			const response = h.response({
				status : "success",
				data : {
					album :{
						id : album.id,
						name : album.name,
						year : album.year,
						coverUrl : album.cover
					}
				}
			});
			response.code(200);
			return response;
	}

	async putAlbumByIdHandler(request, h){
			this._validator.validateAlbumPayload(request.payload);
			const {id} = request.params;
			await this._albumsService.putAlbumById(id, request.payload);
			const response = h.response({
				status : "success",
				message : "berhasil mengubah album",
			});
			response.code(200);
			return response;
		
	}

	async deleteAlbumByIdHandler(request, h){
			const {id} = request.params;
			await this._albumsService.deleteAlbumById(id);
			const response = h.response({
				status : "success",
				message : "berhasil menghapus album",
			});
			response.code(200);
			return response;
  }

	async postAlbumCoverHandler(request, h) {
		const {cover} = request.payload;
		const {id} = request.params;

		await this._validator.validateAlbumCoverPayload(cover.hapi.headers);

		const coverUrl = await this._storageService.writeFile(cover, cover.hapi);
		const fileLocation =  `http://${process.env.HOST}:${process.env.PORT}/albums/images/${coverUrl}`;

		await this._albumsService.addCoverAlbum(id, fileLocation);

		const response = h.response({
				status: 'success',
				message: 'Sampul berhasil diunggah',
		});
		response.code(201);
		return response;
	}

	async postAlbumLikeHandler(request, h) {
		const {id: credentialId} = request.auth.credentials;
		const {id} = request.params;

		await this._albumsService.getAlbumById(id);

		await this._albumsService.verifyExistUser(id, credentialId);
		
		await this._albumsService.addAlbumLike(id, credentialId);

		const response = h.response({
				status: 'success',
				message: 'berhasil menyukai album',
		});
		response.code(201);
		return response;
	}

	async deleteAlbumLikeHandler(request, h) {
			const {id: credentialId} = request.auth.credentials;
			const {id} = request.params;
			
			await this._albumsService.deleteAlbumLike(id, credentialId);

			const response = h.response({
					status: 'success',
					message: 'berhasil menghapus album',
			});
			response.code(200);
			return response;
	}

	async getAlbumLikeHandler(request, h) {
			const {id} = request.params;

			const result = await this._albumsService.getAlbumLike(id);

			if (result.isCache == true) {
					const response = h.response({
							status: 'success',
							data: result.result,
					});
					response.header('X-Data-Source', 'cache');
					return response;
			}

			const response = h.response({
					status: 'success',
					data: result.result,
			});
			return response;
	}

	
}

module.exports = AlbumsHandler;