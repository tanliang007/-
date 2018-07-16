// pages/topup/index.js
const http = require('../../../../utils/http.js') 
Page({

  /**
   * 页面的初始数据
   */
	data: {
		topupType: [],
		curtopup: '',
		id:'',						// 充值所需的id			
		cardNo:''					// 充电卡号
	},

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		this.setData({
			cardNo: options.cardNo
		})
		// 渲染充电卡充值面额列表
		http.get({
			url:'/denomination/index',
			data:{
				type: 2
			},
			success:(res) => {
				console.log(res.data)
				this.setData({
					topupType: res.data
				})
			}
		})
	},

  /**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {

	},

	// 自定义事件
	ontapTopup(e) {			// 设置背景色	
		var curindex = e.currentTarget.dataset.curtopupindex;
		var id = e.currentTarget.dataset.id;
		console.log(id)
		this.setData({
			curtopup: curindex,
			
		})
		this.id =id
	},

	nowPay(){						// 支付事件
		if (this.data.curtopup === 0 || this.data.curtopup ){
			
		}else{
			wx.showToast({
				title: '请选择充值面额',
				icon: 'none',
				duration: 1000
			})
			return false
		}
		console.log(this.data.cardNo)
		http.post({
			url: `/denomination/recharge/${this.id}`,
			requireAuth: true,
			showLoading: true,
			data: {
				cardNo: this.data.cardNo
			},
			success: (res) => {
				if (res.statusCode === 200) {
					console.log(res)
					this.wxTopup(res.data)
				} else {
					console.log(res)
					wx.showToast({ title: red.data, icon: 'none' })
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
				if (res.errMsg === "requestPayment:ok"){
					// wx.redirectTo({
					// 	url: `/pages/mine/index`  //返回个人中心
					// })
					wx.showToast({
						title: '充值成功',
						icon:'none'
					})
				}	
				
			},
			'fail': function (res) {
				wx.showToast({
					title: '您取消了支付',
					icon: 'none'
				})
			}
		})
	},

	navTotopupagreement() {	// 跳转充值协议
		wx.navigateTo({
			url: '/pages/mine/topup/topupagreement/index',
		})
	}
})