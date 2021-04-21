module.exports = {
	async getClips({ homey, params, query, body }) {
		homey.app.getClips((err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
	async addClip({ homey, params, query, body }) {
		homey.app.addClip(body, (err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
	async removeClip({ homey, params, query, body }) {
		homey.app.removeClip(query, (err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
	async getCache({ homey, params, query, body }) {
		homey.app.getCache((err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
	async clearCache({ homey, params, query, body }) {
		homey.app.clearCache((err, result) => {
			return {
				success: err == null,
				error: err,
				result: result
			};
		})
	},
}