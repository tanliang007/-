// pages/mine/eleccardmgt/addelecard/index.js
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		time: '获取验证码',		 					// 倒计时视图	
		VerificationCode: true,					// 倒计时样式切换
		currentTime: 60,  		 					// 初始化倒计时时间
		Activationtypelist: []
	},
	captchaClick: false,		 					// 用户点击了获取验证码	
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {

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

	//////////小程序事件/////////////
	mobileInputEvent: function (e) {		// 手机input失去焦点事件
		this.mobile = e.detail.value

	},

	getVerificationCode(e) { 			// 获取验证码接口
		var mobile = this.mobile
		if (!mobile) {
			wx.showToast(
				{
					title: '获取验证码之前请先填写手机号',
					icon: 'none',
					duration: 1000
				}
			)
			console.log('获取验证码之前请先填写手机号')
			return false
		} else if (!/^1\d{10}$/.test(mobile)) {
			wx.showToast(
				{
					title: '预留号码格式不正确',
					icon: 'none',
					duration: 1000
				}
			)
			console.log('手机号码格式不正确')
			return false
		}

		if (this.captchaClick || e.currentTarget.id == 'countdownnow') {
			console.log('正在倒计时无法点击');
			return false
		}
		this.captchaClick = true
		console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
		this.getCode()
	},

	getCode: function (options) { //倒计时方法
		var mobile = this.mobile
		console.log(mobile)
		//调验证码接口
		http.post({
			url: '/comm/captcha',
			data: { phone: mobile },
			success: (res) => {
				console.log(res)
				if (res.statusCode === 200) {
					var currentTime = this.data.currentTime
					var interval = setInterval(() => {
						currentTime--;
						this.setData({
							time: currentTime + '秒',
							VerificationCode: false
						})
						if (currentTime <= 0) {
							clearInterval(interval)
							this.setData({
								time: '重新发送',
								currentTime: 60,
								VerificationCode: true
							})
							this.captchaClick = false
						}
					}, 1000)
					wx.showToast({
						title: '发送短信验证码成功，请注意查看您的手机',
						icon: 'none'
					})
				} else {
					this.captchaClick = false
				}
			},
		});
	},

	formSubmit(e) {
		var reg = /\s+/g
		var formdata = e.detail.value
		console.log(formdata)
		if (formdata.cardNo == '') {
			wx.showToast({ title: '充电卡号不能为空', icon: 'none' })
			return false
		} else if (formdata.cardNo.length != 10) {
			wx.showToast({ title: '充电卡号长度为10位', icon: 'none' })
			return false
		}
		if (formdata.phone === "") {
			wx.showToast({ title: '预留号码不能为空', icon: 'none' })
			console.log('联系方式不能为空')
			return false
		} else if (!/^1\d{10}$/.test(formdata.phone)) {
			wx.showToast({ title: '预留号码格式不正确', icon: 'none' })
			console.log('联系方式格式不正确')
			return false
		}

		if (formdata.captcha == "") {
			wx.showToast({ title: '验证码不能为空', icon: 'none' })
			console.log('验证码不能为空')
			return false
		}
		// else if (formdata.captcha.length !== 6) {
		// 	wx.showToast(
		// 		{title: '验证码格式不正确',
		// 			icon: 'none',
		// 			duration: 1000
		// 		}
		// 	)
		// 	console.log('验证码格式不正确')
		// 	return false
		// }
		http.post({
			url: '/card/add',
			data: formdata,
			requireAuth: true,
			success: (res) => {
				console.log(res)
				if (res.statusCode == 200) {
					console.log(res)	
					wx.showToast({title: '添加电卡成功',icon:'none'})
					setTimeout(()=>{
						wx.navigateBack({
							delta: 1
						})
					},1100)
				} else {
					wx.showToast({ title: res.data, icon: 'none' })
				}

			},
			fail: (err) => {

			}
		})
	},

	saocard() {							// 扫描桩点编号		
		wx.scanCode({
			success: (res) => {				
				var patrn = /^[0-9]{10}$/;
				if (patrn.test(res.result)) {
					// 是正确的10进制10位数
					this.setData({ cardNo: res.result })
				} else {
					wx.showToast({
						title: '扫码错误请手动输入卡号',
					})
				}

			}
		})
	}
})