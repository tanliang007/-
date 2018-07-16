// pages/details/index.js
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		bonusDetList: [],
		isnull: false,
		screeningType: [{ typename: '桩主收入', typeid: 5, istap: false }, { typename: '物业收入', typeid: 6, istap: false }, { typename: '代理分润', typeid: 7, istap: false }, { typename: '提现', typeid: 8, istap: false }, { typename: '转入余额', typeid: 9, istap: false }, { typename: '平台充值', typeid: 10, istap: false }, { typename: '收益桩收入', typeid: 11, istap: false }, { typename: '结算失败', typeid: 12, istap: false }],
		showscreening: false
	},
	hastypes: false,
	amountArray: { 5: '桩主收入', 6: '物业收入', 7: '代理分润', 8: '提现', 9: '转入余额', 10: '平台充值', 11: '收益桩收入', 12: '结算失败' },
	iconArray: { 5: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E6%A1%A9%E4%B8%BB%E6%94%B6%E5%85%A5@3x.png', 6: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E7%89%A9%E4%B8%9A%E6%94%B6%E5%85%A5@3x.png', 7: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E5%88%86%E6%B6%A6@3x.png', 8: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E6%8F%90%E7%8E%B0%E6%94%B6%E5%85%A5@3x.png', 9: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E8%BD%AC%E5%85%A5@3x.png', 10: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E5%B9%B3%E5%8F%B0%E6%94%B6%E7%9B%8A.png', 11: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E6%94%B6%E7%9B%8A%E6%A1%A9%E6%94%B6%E7%9B%8A.png', 12: 'http://charge-pile.oss-cn-hangzhou.aliyuncs.com/icon/%E7%BB%93%E7%AE%97%E5%A4%B1%E8%B4%A5.png'},
	// 12的类型图片需要更换
	page: 0,				// 初始页码第一页
	size: 10,
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {

	},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {
		// 默认渲染第一页不喜欢types
		this.loadingfirst(this.page)
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		this.page++;
		if (this.hastypes) { // 选择是否传递类型
			this.Pullonloading(this.page, this.globalselectarr);
		} else {
			this.Pullonloading(this.page);
		}
		// if (this.data.loading) return;
		// this.setData({ loading: true });
		// this.updateRefreshIcon();
		// this.page++;
		// setTimeout(() => {
		// 	http.get({
		// 		url: '/bonus/details',
		// 		requireAuth: true,
		// 		data: {
		// 			page: this.page,
		// 			size: 10
		// 		},
		// 		success: (res) => {
		// 			if (res.statusCode === 200) {
		// 				if (res.data.length === 0) {
		// 					this.setData({ hasMore: true });
		// 					this.setData({ loading: false });
		// 					return false
		// 				}
		// 				this.cyclepackaging(this.iconArray, res.data)
		// 				this.cyclepackaging(this.amountArray, res.data)
		// 				this.setData({
		// 					bonusDetList: this.data.bonusDetList.concat(res.data)
		// 				})
		// 				console.log(this.data.bonusDetList)
		// 				// 等加载完才能触发下次
		// 				this.setData({ loading: false });
		// 			}
		// 		}
		// 	})
		// }, 200)
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
	// 处理循环数据
	cyclepackaging(localArray, requestArray) {
		for (var key in localArray) {
			// console.log(key)
			key = parseInt(key)
			for (var j = 0; j < requestArray.length; j++) {
				if (requestArray[j].type === key) {
					requestArray[j].txt = localArray[key]
					if (!requestArray[j].img) {
						requestArray[j].img = localArray[key]
					}
				}
			}
		}
	},

	// 加载第一页数据函数
	loadingfirst(page, types) {
		var obj = {
			page: page,
			size: 10
		}
		types && (obj.types = types)
		console.log(obj)
		// 去掉下拉无内容提示
		this.setData({ hasMore: false });
		http.get({
			url: '/bonus/details',
			requireAuth: true,
			data: obj,
			success: (res) => {
				if (res.statusCode === 200) {
					console.log(res)
					if (res.data.length === 0) {
						!this.data.isnull && (this.setData({ isnull: true }));
						return false
					}
					// 处理闪烁尝试
					this.data.isnull && (this.setData({ isnull: false }));
					this.cyclepackaging(this.iconArray, res.data)
					this.cyclepackaging(this.amountArray, res.data)
					console.log(res.data)
					this.setData({
						bonusDetList: res.data
					})
				}
			}
		})
	},

	// 上拉加载函数 参数page  type  
	Pullonloading(page, types) {
		if (this.data.loading) return;
		this.setData({ loading: true });
		this.updateRefreshIcon();
		var obj = {
			page: page,
			size: 10
		}
		types && (obj.types = types)
		setTimeout(() => {
			http.get({
				url: '/bonus/details',
				requireAuth: true,
				data: obj,
				success: (res) => {
					if (res.statusCode === 200) {
						if (res.data.length === 0) {
							this.setData({ hasMore: true });
							this.setData({ loading: false });
							return false
						}
						this.cyclepackaging(this.iconArray, res.data)
						this.cyclepackaging(this.amountArray, res.data)
						this.setData({
							bonusDetList: this.data.bonusDetList.concat(res.data)
						})
						console.log(this.data.bonusDetList)
						// 等加载完才能触发下次
						this.setData({ loading: false });
					}
				}
			})
		}, 200)
	},

	// 加载动画
	updateRefreshIcon() {
		console.log('旋转开始了.....')
		var animation = wx.createAnimation({
			duration: 1000,
			timingFunction: "linear",
			delay: 0
		});
		var timer = setInterval(() => {
			if (!this.data.loading) {
				console.log(11)
				clearInterval(timer);
			}
			this.setData({
				deg: this.data.deg += 360
			})
			animation.rotateZ(this.data.deg).step();//在Z轴旋转一个deg角度		
			console.log(1)
			this.setData({
				refreshAnimation: animation.export()
			})
		}, 1000);

	},
	// 点击图标弹出筛选弹框
	popupScreening() {
		this.setData({ showscreening: !this.data.showscreening })
		if (!this.data.showscreening) {
			this.resetTap()
		}
	},

	// 收起弹框
	packupScreening() {
		// 将screeningType都重置为false
		this.setData({ showscreening: false })
		this.resetTap()
	},

	// 选择桩主类型 
	chooseScreeningType(e) {
		console.log(e.currentTarget.dataset.typeid)
		var typeid = e.currentTarget.dataset.typeid
		// 根据点击的改变遍历的数组
		var abc = this.data.screeningType;
		var selectarr = [];
		for (var i = 0; i < abc.length; i++) {
			var obj = abc[i];
			if (obj.typeid == typeid) {
				obj.istap = !obj.istap;
				abc.splice(i, 1, obj);
			}
			if (obj.istap) {
				selectarr.push(obj.typeid)
			}
		}
		this.setData({
			screeningType: abc
		})
		// 传递的type放到全局
		this.globalselectarr = selectarr.join(',')
		console.log(this.data.screeningType, selectarr)
	},

	// 确认筛选类型
	sureScreeningType() {
		// 利用一个变量判断是否传types
		this.hastypes = true;
		this.page = 0;
		console.log(typeof this.globalselectarr)

		// 将screeningType都重置为false
		this.resetTap()
		this.loadingfirst(this.page, this.globalselectarr);
		this.setData({ showscreening: false })
	},

	// 重置充值选择状态的函数
	resetTap() {
		var ob = this.data.screeningType;
		for (var j = 0; j < ob.length; j++) {
			var obj = ob[j];
			console.log(obj)
			obj.istap = false
		}
		this.setData({
			screeningType: ob
		})
	}
})