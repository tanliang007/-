// pages/index/rob-pileguide/robpile/index.js
const http = require('../../../../utils/http.js')
const util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		loading: false,				// 是否显示加载动画
		hasMore: false,				// 有无更多数据
		robSiteList: [],			// robSiteList数组
		norobSiteList: false,
		name: '',					  	// 模糊查询发给后台字段
		contentH:0 						//动态赋值高度
	},
	deg: 0,									// 动画旋转的角度
	page: 0,								// 页码
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		// 节流函数优化搜索框
		this.loadData = util.throttle(this.inputSearch, 1000)
	},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {


	},

  /**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {
		this.page = 0
		this.setData({
			robSiteList: []
		})
		wx.getLocation({
			type: 'gcj02',
			success: (res) => {
				this.chargepileObj = {
					page: this.page,
					size: 7,
					latitude: res.latitude,
					longitude: res.longitude
				}
				console.log(this.chargepileObj)
				http.get({ // 默认渲染第一页
					url: '/charge-pile/profitable',
					data: this.chargepileObj,
					showLoading: true,
					loadingText: '加载中',
					success: (res) => {
						console.log(res, '附近收益桩')
						if (res.statusCode === 200) {
							if (res.data.length === 0) {
								this.setData({ norobSiteList: true });
								return false
							}
							this.setData({
								robSiteList: res.data
							})
							console.log(this.data.robSiteList, '默认第一页数据')
						}
					}
				})
			}
		})

	},

  /**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function () {

	},

  /**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function () {

	},

  /**
   * 页面上拉触底事件的处理函数
   */
	onReachBottom: function () {
		this.nextPageSearch()
	},

	nextPageSearch() { //上拉搜索事件
		if (this.data.loading) return;
		this.setData({ loading: true });
		this.updateRefreshIcon();
		this.page++;
		console.log(this.page, '上拉事件页码')
		this.chargepileObj = {
			page: this.page,
			size: 7,
			latitude: this.chargepileObj.latitude,
			longitude: this.chargepileObj.longitude,
			name: this.data.name
		}
		setTimeout(() => {
			http.get({
				url: '/charge-pile/profitable',
				data: this.chargepileObj,
				success: (res) => {
					if (res.statusCode === 200) {
						if (res.data.length === 0) {
							this.setData({ hasMore: true });
							this.setData({ loading: false });
							return false
						}
						// this.updateRefreshIcon();
						console.log('下一页数据',res)
						this.setData({
							robSiteList: this.data.robSiteList.concat(res.data)
						})
						this.setData({ loading: false });
					}
				}
			})
		}, 200)
	},

	navToSite(e) { // 微信内置导航,传递参数为目标地点的经纬度
		const latitude = e.currentTarget.dataset.siteinfo.latitude
		const longitude = e.currentTarget.dataset.siteinfo.longitude

		wx.openLocation({
			latitude: latitude,
			longitude: longitude,
			scale: 28
		})

	},


	updateRefreshIcon() {	 // 加载动画
		var animation = wx.createAnimation({
			duration: 500,
			timingFunction: "linear",
			delay: 0
		});
		var timer = setInterval(() => {
			if (!this.data.loading) {
				clearInterval(timer);
			}
			this.deg = this.deg += 360
			animation.rotateZ(this.deg).step();//在Z轴旋转一个deg角度		
			this.setData({
				refreshAnimation: animation.export()
			})
		}, 1000);

	},

	searchValueInput(e) { 					 // 搜索框的值,实时事件
		this.loadData(e.detail.value)  // 优化的函数节流事件
	},

	inputSearch(name) {				 // 搜索接口调用事件
		this.setData({
			name: name,
			hasMore: false,
			robSiteList: []
		})
		// 搜索第一次查询
		this.page = 0
		this.chargepileObj = {
			page: this.page,
			size: 7,
			latitude: this.chargepileObj.latitude,
			longitude: this.chargepileObj.longitude,
			name: name
		}
		http.get({
			url: '/charge-pile/profitable',
			data: this.chargepileObj,
			success: (res) => {
				console.log(res, '搜索框第一页')
				if (res.statusCode === 200) {
					if (res.data.length === 0) {
						this.setData({
							robSiteList: res.data,
							norobSiteList: true
						})
						return false
					} else {
						this.setData({
							robSiteList: res.data,
							norobSiteList: false
						})
					}
					console.log(this.data.robSiteList, '搜索事件出来的数据=' + this.page)
				}
			}
		})

	},

	navtooInvestPile(e) {						 // 抢庄支付页面跳转
		// 桩点编号
		console.log(e.currentTarget.dataset)
		
		const robinfo = e.currentTarget.dataset.robinfo
		if ( robinfo.sponsors == 10 ){
			return 
		}
		wx.navigateTo({
			url: '../investpile/index?robinfo=' + JSON.stringify(robinfo) 
		})

	}

})