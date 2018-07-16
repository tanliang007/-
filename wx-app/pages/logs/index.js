// pages/logs/index.js
const logger = require('../../utils/logger.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		debugLogs: [],
		infoLogs: [],
		errorLogs: [],
		showdebugLogs: true,
		showinfoLogs: false,
		showerrorLogs: false
	},

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		this.setData({ debugLogs: logger.getDebug() })
		this.setData({ infoLogs: logger.getInfo() })
		this.setData({ errorLogs: logger.getError() })
	},

	dubug() {
		this.setData({
			showdebugLogs: true,
			showinfoLogs: false,
			showerrorLogs: false
		})
	},

	info() {
		this.setData({
			showdebugLogs: false,
			showinfoLogs: true,
			showerrorLogs: false
		})
	},

	error() {
		this.setData({
			showdebugLogs: false,
			showinfoLogs: false,
			showerrorLogs: true
		})
	}

})