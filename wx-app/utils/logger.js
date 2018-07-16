const util = require('./util.js')

function writeLog(destination, level, text) {
	let time = util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
	var data = getLog(destination)
	data.unshift({ 
		time: time, 
		text: JSON.stringify(text),
		level: level
	})
	if (data.length > 100) {
		data.shift()
	}
	wx.setStorageSync('log-' + destination, data)
}

function getLog(destination) {
	return wx.getStorageSync('log-' + destination) || []
}

module.exports = {

	debug: function (text) {
		writeLog('debug', 'debug', text)
	},

	info: function (text) {
		writeLog('info', 'info', text)
		writeLog('debug', 'info', text)
	},

	error: function (text) {
		writeLog('error', 'error', text)
		writeLog('info', 'error', text)
		writeLog('debug', 'error', text)
	},

	getDebug: function() {
		return getLog('debug')
	},

	getInfo: function () {
		return getLog('info')
	},

	getError: function () {
		return getLog('error')
	}

}