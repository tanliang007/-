// pages/index/rob-pileguide/investpile/index.js
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		numberOfShares: 0,          // 抢的收益份数
		price: 0,
		hastapAgreeprotocol: false, // 记录是否点击了协议
		robinfo: '',								// 将收益桩信息存储到data中
		sharearry: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	},
	pileid: '',
	initsponsors: '',							// 记录初始化的股份数
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		// 将收益桩信息存储到data中
		this.setData({ robinfo: JSON.parse(options.robinfo) })
		this.setData({ price: this.data.robinfo.price / 100 })
		console.log(this.data.robinfo)
		// 根据携带的分数参数处理
		// this.data.robinfo.sponsors
		this.initsponsors = this.data.robinfo.sponsors
		this.setInitsharearry(this.data.robinfo.sponsors)

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onPullDownRefresh: function () {

	},

	sureInvest() { // 确定买股份
		// 异常处理开始
		//判断份数是否为0
		console.log(this.data.numberOfShares)
		if (this.data.numberOfShares == 0) {
			wx.showModal({
				title: '请至少购买一个名额',
				showCancel: false,
				content: '',
			})
			return
		}
		if (!this.data.hastapAgreeprotocol) {
			wx.showModal({
				title: '请先勾选抢注桩主协议',
				showCancel: false,
				content: '',
			})
			return
		}
		http.post({
			url: `/charge-pile-sponsor/buy`,
			showLoading: true,
			requireAuth: true,
			loadingText: '请稍等',
			data: {
				pileId: this.data.robinfo.pileId,
				count: this.data.numberOfShares
			},
			success: (res) => {
				console.log(res)
				if (res.statusCode == 200) {
					this.wxpay(res.data)
				} else {
					wx.showModal({
						title: res.data,
						showCancel: false,
						content: '',
					})
				}
			}

		})


	},
	// 减少股份
	minus() {


		this.minsSharearry()
	},
	// 加股份
	plus() {
		// this.data.numberOfShares++;
		// this.setData({
		// 	numberOfShares: this.data.numberOfShares
		// })

		this.plusSharearry()

	},

	agreeprotocol() {
		// 记录是否点击了抢注协议
		this.setData({
			hastapAgreeprotocol: !this.data.hastapAgreeprotocol
		})
	},

	wxpay(payInfo) {
		wx.requestPayment({
			'timeStamp': payInfo.timestamp,
			'nonceStr': payInfo.noncestr,
			'package': payInfo.packageValue,
			'signType': payInfo.signType,
			'paySign': payInfo.sign,
			'success': function (res) {
				console.log(res, 'success进来了')
				if (res.errMsg === "requestPayment:ok") {
					wx.redirectTo({
						url: './robpilesuccess/index',
					}) 
				}

			},
			'fail': function (res) {
				// wx.showToast({
				// 	title: '您取消了支付',
				// 	icon: 'none'
				// })
			}
		})
	},

	// 初始化股份进度条
	setInitsharearry(len) {

		for (var i = 0; i < len; i++) {
			this.data.sharearry[i] = 1
		}
		this.data.sharearry.reverse() 
		this.setData({ sharearry: this.data.sharearry })

	},

	//动态份数效果
	plusSharearry() {
		this.data.numberOfShares++
		this.data.robinfo.sponsors++ 
		if (this.data.robinfo.sponsors > 10) {
			this.data.robinfo.sponsors = 10
			this.setData({
				numberOfShares: 10 - this.initsponsors
			})
			return
		}
			// 重置
		this.circulation()
	},

	minsSharearry() {
		this.data.numberOfShares--
		this.data.robinfo.sponsors--
		if (this.data.robinfo.sponsors < this.initsponsors) {
			this.data.robinfo.sponsors = this.initsponsors
			this.setData({
				numberOfShares: 0
			})
			console.log(this.data.robinfo.sponsors)
			return
		}
		// 重置
		this.circulation()

	},

	circulation(){
		for (var j = 0; j < this.data.sharearry.length; j++) {
			this.data.sharearry[j] = 0
		}
		for (var i = 0; i < this.data.robinfo.sponsors; i++) {
			this.data.sharearry[i] = 1
		}
		this.data.sharearry.reverse()
		this.setData({
			sharearry: this.data.sharearry,
			numberOfShares: this.data.numberOfShares
		})
	}
})