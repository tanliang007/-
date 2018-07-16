// pages/pilepoint-list/index.js
const http = require('../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		haspilepointList: true,
		pilepointList: '',       // 站点里的桩点列表
		siteId: '',   			     // 传过来的站点id
		sitedetail: ''			     // 站点详情
	},

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		this.setData({
			siteId: options.siteId
		})
	},

  /**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {
		http.post({ //充电站详情
			url: `/charge-site/show/${this.data.siteId}`,
			success: (res) => {
				console.log(res)
				if (res.statusCode === 200) {
					this.setData({
						sitedetail: res.data,
						sitelatitude: res.data.latitude,
						sitelongitude: res.data.longitude
					})
				} else {
					wx.showToast({
						title: res.data,
						icon: 'none',
						duration: 2000
					})
				}
			}
		})

		http.post({ //桩列表信息
			url: '/charge-pile/index',
			data: {
				siteId: this.data.siteId
			},
			success: (res) => {
				console.log(res)
				if (res.statusCode === 200) {
					if (res.data.length === 0) {
						this.setData({
							haspilepointList: false
						})
					}
					// 存储经纬度值跳转到添加新桩点
					this.setData({
						pilepointList: res.data
					})
				} else {
					wx.showToast({
						title: res.data,
						icon: 'none',
						duration: 2000
					})
				}
			}
		})

	}
})