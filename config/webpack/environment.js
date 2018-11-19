var webpack = require("webpack");

module.exports = {
	plugins: [
		new webpack.DefinePlugin({ ...process })
	]
};

const { environment } = require('@rails/webpacker')

module.exports = environment
