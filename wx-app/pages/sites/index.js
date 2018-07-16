// pages/sites/index.js
const http = require('../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		hassite: false,
		siteList: '',
		statuArr: ['审核中', '', '已下线']
	},
	agentId: '',
	
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
	},
	onReady: function () {
	},
  /**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {
		this.agentId = wx.getStorageSync('user-info').agentId
		console.log(wx.getStorageSync('user-info'), '站点列表21行')
		console.log(this.agentId, '站点列表22行')
		http.get({
			url: '/charge-site/index',
			data: {
				agentId: this.agentId
			},
			requireAuth: true,
			success: (res) => {
				console.log(res);
				if (res.statusCode === 200) {
					if (res.data.length == 0) {
						this.setData({
							hassite: true
						})
					} else {
						this.setData({
							hassite: false,
							siteList: res.data
						})
					}
				} else {
					wx.showToast({
						title: res.data,
						icon: 'none',
						duration: 2000
					})
				}
			}
		})

	},

	//---- 自己的事件 ----
	navToDetail(e) {
		const siteId = e.currentTarget.dataset.siteid
		wx.navigateTo({
			url: './site-detail/index?siteId=' + siteId
		})
	}
})