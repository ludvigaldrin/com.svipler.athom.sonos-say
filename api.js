module.exports = {
	async getClips({ homey, params, query, body }) {
		return homey.app.getClips();
	},
	async getClip({ homey, params, query, body }) {
		return homey.app.getClip(query.name);
	},
	async addClip({ homey, params, query, body }) {
		await homey.app.addClip(body, (err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
	async removeClip({ homey, params, query, body }) {
		await homey.app.removeClip(query.name, (err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
	async getCache({ homey, params, query, body }) {
		return homey.app.getCache();
	},
	async clearCache({ homey, params, query, body }) {
		await homey.app.clearCache((err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
}