const app = getApp()
const http = require('../../../utils/http.js')
const constant = require('../../../utils/constant.js')
const util = require('../../../utils/util.js')
const logger = require('../../../utils/logger.js')

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		charging: null, // 是否在充电		
		power: 0,
		Isthetiming: '00:00:00', // 正计时视图					
		countdown: '00:00:00', // 倒计时视图
		realConsumption: 0.00, // 已经消费金额	
		showModalStatus: false, // 控制查询电缆提示模态框
		showFinshDialogue: false, // 充电完成对话框
		context: '',
		finshtext: '', // 自定义对话框文字
		txtColor: '', // 定时切换类名
		finshreason: '',
		recordId: '',
		siteName: '',          // 本地地名展示	
		suspendstyle: true,    // 是否显示断电样式
		pageDeep: 0, 					 // 页码深度
		controlCharginginfo: false // 充电桩点信息是否显示
	},

	viewUnloaded: false, // 尝试处理切换过快导航栏动态设置异常	
	curPileId: 0, // 接口需要的桩点Id	
	curPileTimeInfo: null, // 接口需要的时间和端口信息
	textTimer: '', // 异常文字闪烁定时ID
	showed: true, // 判定是不是渲染倒计时视图	
	minusTimer: null,
	plusTimer: null,
	positiveobj: '', // 正计时视图包括消费金额
	countdown: '', // 倒计时视图
	hidetriggered: false, // onhide是否触发												
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log('control 中的onLoad')
		// 取本地站点下当前的桩点Id
		this.curPileId = wx.getStorageSync('curPileId')
		console.log(this.curPileId, '当前桩点id')
		// 取取桩点下的端口时长信息
		this.curPileTimeInfo = wx.getStorageSync('curPileTimeInfo')
		// 本地展示地名
		this.setData({
			siteName: wx.getStorageSync('siteName'),
			siteAddress: wx.getStorageSync('siteAddress'),
			pileNo: wx.getStorageSync('pileNo'),
			portNum: this.curPileTimeInfo.port,
			pileAddress: wx.getStorageSync('pileAddress')
		})
		app.setChagePageShowing(true)
		let status = app.getChargeStatus()
		if (status == constant.WAIT_CHARGE || status == constant.CHARGING) {
			this.renderRunStatus()
		}
		if (status == constant.WAIT_NOTICE) {
			app.registeListenDoneCallback(() => {
				this.renderRunStatus()
			})
		}
		app.registeChargeStatusCallback(constant.WAIT_CHARGE, () => {
			this.renderPageForWaitCharge()
			this.renderRunStatus()
		})
		app.registeChargeStatusCallback(constant.CHARGING, (data) => {
			// 存在瓦数显示瓦数
			if (data && data.power) {
				this.setData({ power: data.power })
			}
			this.setData({ suspendstyle: true })
			this.renderPageForCharging()
			this.renderRunStatus()
		})
		app.registeChargeStatusCallback(constant.CHARG_SUSPEND, () => {
			console.log('充电暂停 回调处理')
			// 切换断电样式
			this.setData({ suspendstyle: false })
			// 显示红色背景
			this.renderPageForWaitCharge()
			this.suspendStateQuery()
		})
		app.registeChargeStatusCallback(constant.CHARG_FINISH, (data) => {
			this.afterChargeFinished(data.message)
		})
		// app - charge -continue
		// 获取页码深度
		this.setData({
			pageDeep: getCurrentPages().length
		})
	},

	onReady() {
		console.log('onready')
	},

	onShow() {
		console.log('control 中的 onshow走了')
		// 记录进来的时间
		this.shownowtime = Date.now()
		this.showed = true;
		// onhide记录产生的时间重新赋值
		if (this.hidetriggered) {
			this.thetiming = this.hidethetiming
			this.Thecountdown = this.hideThecountdown
			this.thetiming += (this.shownowtime - this.hidenowtime) / 1000
			this.Thecountdown -= (this.shownowtime - this.hidenowtime) / 1000
			console.log('106行onshow=', this.thetiming, this.Thecountdown)
		}
		// 将控制当行标题的全局变量设置为false
		this.viewUnloaded = false
		console.log(this.viewUnloaded)

		setTimeout(() => {
			let wsOpen = wx.getStorageSync('ws-open')
			console.log('wsOpen = ' + wsOpen)
			if (wsOpen == 0) {
				app.registeListenDoneCallback(() => {
					console.log('监听完成回调')
					this.renderRunStatus()
				})
				let recordId = wx.getStorageSync('recordId')
				app.startListenStompMessage(recordId)
			}
		}, 3000)

	},

	onHide() {
		console.log('onHide')
		// 说明出去了不选视图
		this.showed = false;
		// 记录当前的毫秒数
		this.hidenowtime = Date.now();
		// 记录当前出去的时候  正计时  倒计时的时间
		this.hidethetiming = this.thetiming
		this.hideThecountdown = this.Thecountdown
		// 说明onhide触发了
		this.hidetriggered = true;
		console.log(this.thetiming, this.hideThecountdown, '// 记录当前出去的时候  正计时  倒计时的时间')
	},

	onUnload() {
		app.clearChargeStatusCallbacks()
		app.setChagePageShowing(false)
		console.log('onUnload')
		clearInterval(this.minusTimer)
		clearInterval(this.plusTimer)
		this.viewUnloaded = true;
	},

	onButtonClick() { // 查询电缆是否接好
		if (this.data.charging) {
			wx.showModal({
				title: '是否结束充电',
				content: '',
				success: (res) => {
					if (res.confirm) { // 停止充电，调用停止充电接口
						console.log('用户点击确定')
						this.stopCharging(wx.getStorageSync('recordId'))
					}
				}
			})
		} else {
			console.log('查询电缆是否已接好')
			// else进入接通电缆
			// 查询电缆是否已接好 主动调用接口查询一次（回调查到了就直接有了没有就过会有）
			let recordId = wx.getStorageSync('recordId')
			http.get({
				url: `/charge-record/status/${recordId}`,
				requireAuth: true,
				showLoading: true,
				data: this.curPileTimeInfo,
				success: (res) => {
					if (res.statusCode == 200) {
						console.log(res)
						let status = res.data.status
						if (status == 5) {
							this.modaltipInfo('电缆还没有接好哦')
						}
						if (status == 1) {
							wx.hideLoading()
							this.renderPageForCharging()
							app.updateChargeStatus(constant.CHARGING)
							this.timingStatus(res)
						} else {

						}
					}
				}
			})
		}
	},

	// 返回首页按钮处理
	onBackorStopClick() {
		if (this.data.charging) {
			wx.redirectTo({ url: '/pages/index/index' })
		} else {
			wx.showModal({
				title: '是否结束充电',
				content: '',
				success: (res) => {
					if (res.confirm) { // 停止充电，调用停止充电接口
						console.log('用户点击确定')
						this.stopCharging(wx.getStorageSync('recordId'))
					}
				}
			})
		}
	},

	// 扫码进入时候充电状态返回首页方法
	chargeingbackbtn() {
		wx.redirectTo({ url: '/pages/index/index' })
	},

	// 断电状态停止充电接口
	onpowerToStop() {
		wx.showModal({
			title: '是否结束充电',
			content: '',
			success: (res) => {
				if (res.confirm) { // 停止充电，调用停止充电接口
					console.log('用户点击确定')
					this.stopCharging(wx.getStorageSync('recordId'))
				}
			}
		})
	},

	// 等待负载时的页面渲染（切换为红色主题）
	renderPageForWaitCharge() {
		console.log('等待负载红色主题')
		this.setData({ 'charging': false })
		this.textAnaition()
		if (this.viewUnloaded) {
			return
		}
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#eb5150'
		})
		this.transferBarColor = false;
	},

	// 正在充电状态的页面渲染（切换为绿色主题）
	renderPageForCharging() {

		if (this.textTimer) {
			clearInterval(this.textTimer)
		}
		this.setData({ 'charging': true })
		if (this.viewUnloaded) {
			return
		}
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#24c771'
		})
		this.transferBarColor = true;
	},

	// 查询端口运行状态，开始正计时和倒计时
	renderRunStatus() {
		// console.log('renderRunStatus --- ', this.curPileId)
		// console.log('curpileInfo --- ', this.curPileTimeInfo)
		let recordId = wx.getStorageSync('recordId')
		http.get({
			url: `/charge-record/status/${recordId}`,
			requireAuth: true,
			data: this.curPileTimeInfo,
			success: (res) => {
				if (res.statusCode == 200) {
					let data = res.data
					switch (data.status) {
						case 0:	// 待支付		
							break;
						case 1:	// 充电中
							this.renderPageForCharging()
							this.timingStatus(res)
							this.setData({ power: data.power })
							this.setData({ suspendstyle: true })
							break;
						case 2:	// 充电完成	
							this.afterChargeFinished(data.message)
							break;
						case 3:	// 充电失败	
							this.afterChargeFinished(data.message)
							break;
						case 4:	// 充电暂停		
							this.setData({ suspendstyle: false })
							this.renderPageForWaitCharge()
							this.suspendStateQuery()
							break;
						case 5:	// 等待负载	
							this.renderPageForWaitCharge()
							this.timingStatus(res)
							break;
					}
				}
			}
		})

	},

	// 断电状态下查询充电时间
	suspendStateQuery() {
		clearInterval(this.minusTimer)
		clearInterval(this.plusTimer)
	},

	// 正计时，倒计时，金额效果函数
	timingStatus(res) {
		clearInterval(this.minusTimer)
		clearInterval(this.plusTimer)
		var statusdata = res.data
		// 剩余充电时间倒计时					
		this.Thecountdown = statusdata.totalMinutes * 60 - statusdata.consumeSeconds
		this.setData({ power: statusdata.power })
		// console.log(Thecountdown)
		this.minusTimer = setInterval(() => {
			if (this.Thecountdown <= 0) {
				clearInterval(this.minusTimer)
			}
			this.countdown = util.formatSeconds(this.Thecountdown);
			this.Thecountdown--;
			if (this.showed) { // 在前台运行才一直更新视图
				this.setData({
					countdown: this.countdown,
				})
			}
		}, 1000)
		// 已充电正计时
		this.thetiming = res.data.consumeSeconds
		var total = res.data.totalMinutes * 60
		console.log(total)
		this.plusTimer = setInterval(() => {
			console.log('正定时器走了')
			if (this.thetiming > total) {
				clearInterval(this.plusTimer)
			}
			this.positiveobj = util.theTimeSeconds(this.thetiming, res.data.pricePerHour);
			this.thetiming++;
			if (this.showed) { // 在前台运行才一直更新视图
				console.log('计时视图渲染中', this.positiveobj)
				this.setData({
					Isthetiming: this.positiveobj.result,
					realConsumption: this.positiveobj.money
				})
			}
		}, 1000)

	},

	// 自动充电完成处理
	afterChargeFinished(finishMessage) {
		// TODO: 显示完成对话框，展示完成原因，用户点击确认后更新充电状态为 NO_CHARGING
		clearInterval(this.minusTimer)
		clearInterval(this.plusTimer)
		this.setData({
			finshtext: finishMessage,
			showFinshDialogue: true
		})

		if (this.transferBarColor) {
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#126338'
			})
		} else {
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#752828'
			})
		}

	},

	//接口停止充电
	stopCharging(recordId) {
		// test 
		http.post({
			url: `/charge-record/stop/${recordId}`,
			requireAuth: true,
			showLoading: true,
			loadingText: '正在停止',
			success: (res) => {
				if (res.statusCode === 200) {
					clearInterval(this.minusTimer)
					clearInterval(this.plusTimer)
					// 重置充电状态停止wb监听
					app.updateChargeStatus(constant.NO_CHARGING)
					app.stopListenStompMessage()
					wx.redirectTo({
						url: `/pages/mine/records/detail/index?recordId=${recordId}`,
					})
				} else {
					wx.showModal({
						title: res.data,
						showCancel: false
					})
				}
			}
		})
	},

	// 查询电缆弹框消失事件
	powerDrawer() {
		this.setData({
			showModalStatus: false
		})
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#eb5150'
		})
	},

	// 设置弹窗中文文字
	modaltipInfo(info) {
		this.setData({
			showModalStatus: true,
			context: info
		})
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#752828'
		})
		setTimeout(() => {

			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#eb5150'
			})

			this.setData({
				showModalStatus: false
			})
		}, 5000)
	},

	chargeFinshConfirm() { // 自定义模态框完成事件
		app.updateChargeStatus(constant.NO_CHARGING)
		let recordId = wx.getStorageSync('recordId')
		app.stopListenStompMessage()
		console.log(recordId)
		// 掉接口跳转页面
		wx.redirectTo({
			url: `/pages/mine/records/detail/index?recordId=${recordId}`,
		})

	},

	// 文字动画类名切换
	textAnaition() {
		clearInterval(this.textTimer)
		var num = 0;
		this.textTimer = setInterval(() => {
			var classname = num % 2 == 0 ? "hehongColor" : "defaultColor"
			this.setData({
				txtColor: classname
			})
			num++;
			if (num == 2) {
				num = 0
			}
		}, 1000)
	},

	// 控制桩点信息的文字是否显示
	controlShowCharginginfo(){
		this.data.controlCharginginfo = !this.data.controlCharginginfo
		this.setData({
			controlCharginginfo: this.data.controlCharginginfo
		})
	}

})