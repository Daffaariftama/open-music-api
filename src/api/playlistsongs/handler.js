const ClientError = require("../../exceptions/ClientError");

class PlaylistsongsHandler {
	constructor(playlistsongsService, playlistsService, validator) {
		this._playlistsongsService = playlistsongsService;
		this._playlistsService = playlistsService;
		this._validator = validator;

    this.postPlaylistsongHandler = this.postPlaylistsongHandler.bind(this);
    this.getPlaylistsongByIdHandler = this.getPlaylistsongByIdHandler.bind(this);
    this.deletePlaylistsongHandler = this.deletePlaylistsongHandler.bind(this);
  }

	async postPlaylistsongHandler(request, h) {
		this._validator.validatePlaylistsongPayload(request.payload);

		const { id : credentialId} = request.auth.credentials;
		const { id : playlistId} = request.params;
		const { songId } = request.payload;

		await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
		const playlistsongId = await this._playlistsongsService.addPlaylistsong({playlistId, songId});

		const response = h.response({
			status: "success",
        message: "Lagu berhasil ditambahkan",
        data: {
          playlistsongId,
        },
		});
		response.code(201);
		return response;
	}

	async getPlaylistsongByIdHandler(request, h) {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const playlist = await this._playlistsongsService.getPlaylistsongById(playlistId);

      return {
        status: "success",
        data: {
          playlist
        },
      };
		}

		async deletePlaylistsongHandler(request, h) {
				this._validator.validatePlaylistsongPayload(request.payload);
				const { id: credentialId } = request.auth.credentials;
				const { songId } = request.payload;
				const { id: playlistId } = request.params;
	
				await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
				await this._playlistsongsService.deletePlaylistsong(songId, playlistId);
	
				return {
					status: "success",
					message: "Lagu berhasil dihapus",
				};
			}
}

module.exports = PlaylistsongsHandler;