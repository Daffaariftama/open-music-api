class ExportsHandler{
  constructor(exportsService, playlistsService, validator) {
    this._playlistsService = playlistsService;
    this._exportsService = exportsService;
    this._validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h){
    this._validator.validateExportPlaylistsPayload(request.payload);
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId: playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._exportsService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;

  }
}

module.exports = ExportsHandler;