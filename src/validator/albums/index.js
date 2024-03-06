const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, albumCoverPayloadSchema } = require('./schema');

const AlbumsValidator = {
	validateAlbumPayload: (payload) => {
		const validationResult = AlbumPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},

	validateAlbumCoverPayload: (headers) => {
		const validationResult = albumCoverPayloadSchema.validate(headers);

		if (validationResult.error) {
				throw new InvariantError(validationResult.error.message);
		}
	},
};

module.exports = AlbumsValidator;