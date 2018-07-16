// pages/mine/topup/cardrecharge/index.js
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		topupType: [],
		cardinputlength: 0,		// 输入框文字的个数
		curtopup: '',
		id: ''								// 充值所需的id		
	},
	cardNo: '',							// 卡片number
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		// 渲染充值面额列表
		http.get({
			url: '/denomination/index',
			data: {
				type: 2
			},
			success: (res) => {
				console.log(res.data)
				this.setData({ topupType: res.data })
			}
		})

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

	// 自定义事件
	navTobalancetop() {	// 代充页面跳转到余额充值页面
		wx.navigateTo({ url: '/pages/mine/topup/index' })
	},

	getcardNumber(e) {
		// 输入框数字达到10按钮颜色改变
		var length = e.detail.value.length
		if (length == 10) {
			this.setData({
				cardinputlength: true
			})
			this.cardNo = e.detail.value
		} else {
			this.setData({
				cardinputlength: false
			})
			this.cardNo = ""
		}

	},

	ontapTopup(e) {			// 设置背景色	
		var curindex = e.currentTarget.dataset.curtopupindex;
		var id = e.currentTarget.dataset.id;
		console.log(id)
		this.setData({
			curtopup: curindex,
		})
		this.id = id
	},

	nowPay(e) {						// 支付事件
		// if (e.currentTarget.id == 'graypay'){
		// 	return false
		// }
		if (!this.cardNo) {
			wx.showToast({ title: '请填写10位充卡卡号', icon: 'none' })
			return false
		}
		if (this.data.curtopup === 0 || this.data.curtopup) {

		} else {
			wx.showToast({ title: '请选择卡的充值面额', icon: 'none', })
			return false
		}
		console.log(this.cardNo)
		http.post({
			url: `/denomination/recharge/${this.id}`,
			data: {
				cardNo: this.cardNo,
				showLoading: true
			},
			requireAuth: true,
			success: (res) => {
				if (res.statusCode === 200) {
					console.log(res)
					this.wxTopup(res.data)
				} else {
					wx.showToast({ title: res.data, icon: 'none' })
				}
			}
		})
	},

	wxTopup(payInfo) {	// 微信支付方法
		wx.requestPayment({
			'timeStamp': payInfo.timestamp,
			'nonceStr': payInfo.noncestr,
			'package': payInfo.packageValue,
			'signType': payInfo.signType,
			'paySign': payInfo.sign,
			'success': function (res) {
				console.log(res, 'success进来了')
				if (res.errMsg === "requestPayment:ok") {
					// wx.redirectTo({
					// 	url: `/pages/mine/index`  //返回个人中心
					// })
					wx.showToast({ title: '充值成功', icon: 'none' })
				}

			},
			'fail': function (res) {
				wx.showToast({ title: '您取消了支付', icon: 'none' })
			}
		})
	},

	saocard() {							 // 扫描充电卡号
		wx.scanCode({
			success: (res) => {
				console.log(res);
				var patrn = /^[0-9]{10}$/;
				if (patrn.test(res.result)) {
					// 是正确的10进制10位数
					this.setData({ 
						viewCardNum: res.result, 
						cardinputlength: true 
				  })
					this.cardNo = res.result

				} else {
					wx.showToast({
						title: '扫码错误请手动输入卡号',
					})
				}
			}

		})
	},

	navTotopupagreement() {	// 跳转充值协议
		wx.navigateTo({
			url: '/pages/mine/topup/topupagreement/index',
		})
	}

})