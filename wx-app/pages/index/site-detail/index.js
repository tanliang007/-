// pages/pilepoint-list/index.js
const http = require('../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		pilepointList: '',      //站点里的桩点列表
		siteId: '',   			      //传过来的站点id
		sitedetail: ''			    //站点详情
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
						sitedetail: res.data
					})
				} else {
					wx.showToast({ title: res.data, icon: 'none' })
				}
			}
		})

		wx.getLocation({
			type: 'gcj02',
			success: (res) => {
				this.chargesiteObj = {
					latitude: res.latitude,
					longitude: res.longitude
				}
				console.log(this.chargesiteObj)
				getpileinfo(this.chargesiteObj)
			}
		})

		var getpileinfo = (chargesiteObj) => {
			chargesiteObj.siteId = this.data.siteId
			console.log(chargesiteObj)
			http.get({ //桩列表信息
				url: '/charge-pile/index',
				data: chargesiteObj,
				success: (res) => {
					console.log(res)
					if (res.statusCode === 200) {
						if (res.data.length == 0) {
							this.setData({
								nopilepointlist: true
							})
						} else {
							this.setData({
								pilepointList: res.data
							})
						}
					} else {
						wx.showToast({ title: res.data, icon: 'none' })
					}
				}
			})
		}



	},

	// 跳转充电详情
	navToChargedetail(e) {
		if (!e.currentTarget.dataset.online) {
			wx.showToast({ title: '该桩未上线', icon: 'none' })
			return false
		}

		let pileNo = e.currentTarget.dataset.pileno
		console.log(e)
		let scene = encodeURIComponent(pileNo)
		console.log(scene)
		wx.navigateTo({
			url: '/pages/charge/detail/index?scene=' + scene,
		})
	},

	// 导航到桩点
	navTopile(e) {										 // 微信内置导航,传递参数为目标地点的经纬度
		if (!e.currentTarget.dataset.online) {
			wx.showToast({ title: '该桩未上线', icon: 'none' })
			return false
		}
		const latitude = e.currentTarget.dataset.targetlat
		const longitude = e.currentTarget.dataset.targetlng

		console.log(latitude, longitude)
		wx.openLocation({
			latitude: latitude,
			longitude: longitude,
			scale: 28
		})

	},
})