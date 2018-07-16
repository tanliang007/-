// pages/index/near-pites/index.js
const http = require('../../../utils/http.js')
const util = require('../../../utils/util.js')

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		searchValue: '', // input实时的值
		name: '', // 模糊查询发给后台字段
		loading: false, // 是否显示加载动画
		hasMore: false, // 有无更多数据
		nearSiteList: [], // 附件站点
		nonearsite: false
	},
	deg: 0, // 动画旋转的角度
	page: 0, // 页码
	chargesiteObj: {}, // 充电站传递对象
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
		console.log('onready')
		wx.getLocation({
			type: 'gcj02',
			success: (res) => {

				this.chargesiteObj = {
					page: this.page,
					size: 8,
					latitude: res.latitude,
					longitude: res.longitude
				}
				console.log(this.chargesiteObj)
				http.get({ // 默认渲染第一页
					url: '/charge-pile/index',
					data: this.chargesiteObj,
					success: (res) => {
						console.log(res, '附近站点48行')
						if (res.statusCode === 200) {
							if (res.data.length === 0) {
								this.setData({ nonearsite: true });
								return false
							}
							// 造数据!!以后需要删除
							this.circulation(res.data)
							console.log(res.data, '--------------');
							this.setData({
								nearSiteList: res.data,
							}, () => {
								//创建节点选择器
								var query = wx.createSelectorQuery();
								//选择id
								query.selectAll('#mjltest').boundingClientRect()
								query.exec((res) => {

									// var k = res[0].width + 'px'
									//res就是 所有标签为mjltest的元素的信息 的数组
									// this.setData({ activewidth: k })

									res[0].forEach((rect, index) => {
										this.data.nearSiteList[index]['activewidth'] = rect.width

									})
									this.setData({ nearSiteList: this.data.nearSiteList })
								})

							})
						}
					}
				})
			}
		})

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		console.log('加载更多')
		this.nextPageSearch()
	},

	searchValueInput(e) { // 搜索框的值,实时事件
		this.loadData(e.detail.value)
	},

	// ---- 自定义事件 ----
	inputSearch(name) { // 搜索接口事件

		this.setData({
			name: name,
			hasMore: false
		})
		// 搜索第一次查询
		this.page = 0
		this.chargesiteObj = {
			page: this.page,
			size: 8,
			latitude: this.chargesiteObj.latitude,
			longitude: this.chargesiteObj.longitude,
			name: name
		}
		// console.log(this.chargesiteObj)
		// // 默认渲染第一页
		http.get({
			url: '/charge-pile/index',
			data: this.chargesiteObj,
			success: (res) => {
				console.log(res, '搜索框第一页')
				if (res.statusCode === 200) {
					if (res.data.length === 0) {
						this.setData({
							nearSiteList: res.data,
							nonearsite: true
						})
						return false
					}

					// 造数据!!以后需要删除
					this.circulation(res.data)
					console.log('搜索的新数据 page是0', res.data)		
					this.setData({
						nearSiteList: res.data,
						nonearsite: false
					},
						() => {
							//创建节点选择器
							var query = wx.createSelectorQuery();
							//选择id
							query.selectAll('#mjltest').boundingClientRect()
							query.exec((res) => {

								// var k = res[0].width + 'px'
					
								//res就是 所有标签为mjltest的元素的信息 的数组
								// this.setData({ activewidth: k })

								res[0].forEach((rect, index) => {
									this.data.nearSiteList[index]['activewidth'] = rect.width
								})
								this.setData({ nearSiteList: this.data.nearSiteList })
							})

						}
					)
				}
			}
		})

	},

	nextPageSearch() { //上拉搜索事件
		if (this.data.loading) return;
		this.setData({ loading: true });
		this.updateRefreshIcon();
		this.page++ ;
		this.chargesiteObj = {
			page: this.page,
			size: 8,
			latitude: this.chargesiteObj.latitude,
			longitude: this.chargesiteObj.longitude,
			name: this.data.name
		}
		setTimeout(() => {
			http.get({
				url: '/charge-pile/index',
				data: this.chargesiteObj,
				success: (res) => {
					if (res.statusCode === 200) {
						if (res.data.length === 0) {
							this.setData({ hasMore: true });
							this.setData({ loading: false });
							return false
						}

						// 造数据!!以后需要删除
						this.circulation(res.data)
						console.log('下一页数据page是=' + this.page, res.data)
						var nextPageData = this.data.nearSiteList.concat(res.data)
						this.setData({
							nearSiteList: nextPageData
						},
							() => {
								//创建节点选择器
								var query = wx.createSelectorQuery();
								//选择id
								query.selectAll('#mjltest').boundingClientRect()
								query.exec((res) => {

									// var k = res[0].width + 'px'
									console.log(res)
									//res就是 所有标签为mjltest的元素的信息 的数组
									// this.setData({ activewidth: k })

									res[0].forEach((rect, index) => {
										this.data.nearSiteList[index]['activewidth'] = rect.width
									})
									this.setData({ nearSiteList: this.data.nearSiteList })
								})

							}
						)
						this.setData({ loading: false });
					}
				}
			})
		}, 100)
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

	updateRefreshIcon() { // 加载动画
		console.log('旋转开始了.....')
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
			animation.rotateZ(this.deg).step(); //在Z轴旋转一个deg角度		
			this.setData({
				refreshAnimation: animation.export()
			})
		}, 1000);

	},

	navTositedetail(e) { // 跳转站点详情
		if (!e.currentTarget.dataset.online) {
			wx.showToast({ title: '该桩未上线', icon: 'none' })
			return false
		}
		let pileNo = e.currentTarget.dataset.pileno
		let scene = encodeURIComponent(pileNo)
	
		//  造假数据 超过三公里  才传递伪造的端口号 以后要处理删除
		if (e.currentTarget.dataset.distance.indexOf('千米') != -1 && (parseFloat(e.currentTarget.dataset.distance) > 3 && e.currentTarget.dataset.needforge)) {
			console.log('超过三公里')
			let avaliable = e.currentTarget.dataset.avaliable
			wx.navigateTo({
				url: '/pages/charge/detail/index?scene=' + scene + '&avaliable=' + avaliable,
			})

		} else {
			wx.navigateTo({
				url: '/pages/charge/detail/index?scene=' + scene
			})
		}

	},

	randomed() {
		var a = parseInt(Math.random() * (10 - 6 + 1) + 6)
		console.log(a)
		return a
	},

	circulation(data) {
		for (var k = 0; k < data.length; k++) {
			let element = data[k]
			if (element.distance.indexOf('千米') != -1){
				if (parseFloat(element.distance) > 3 && element.avaliable == 10) {
					// 字段判读是否伪造了端口
					element.needforge = true
					element.avaliable = this.randomed()
				} else {
					element.needforge = false
				}

			}
			
		}
	}

})