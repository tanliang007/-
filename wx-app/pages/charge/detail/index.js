// pages/charge-details/index.js
const app = getApp()
const auth = require('../../../utils/auth.js')
const http = require('../../../utils/http.js')
const client = require('../../../utils/client.js')
const constant = require('../../../utils/constant.js')
const logger = require('../../../utils/logger.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chargingWrapper: '',
    status: ['空闲', '占用', '禁用', '故障'],
    Chargingpile: [], // 桩点号
    timelength: [], // 时长
    curindex: '', // 控制桩点背景色
    curtimeindex: '', // 控制充电时长背景色
    pileNo: '', // 显示桩点编号
    timePrice: 0, // 充电费用	
    balance: '', // 钱包余额
    minusWallet: 0, // 扣除钱包余额
    pageDeep: 0,
    timeAndPriceIndex: 7, //picker的索引
    isTapTime: true, // 记录已经点击了时长
  },
  isTapPort: false, // 记录已经点击了端口
  hour: 0, // 支付接口传时长	
  pileNo: '', // 扫码出来的imei用来请求接口
  pileId: 0, // 站点下的扫码的桩点id
  sendport: '', // 记录支付的端口
  recordId: 0, // 本次开始的充电记录ID
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onLoad: function(options) {
    logger.debug('CHARGE DETAIL')
    console.log(options)
    // pileNo 扫码在这里
    if (options.scene) {
      this.pileNo = decodeURIComponent(options.scene)
      // 以后需要删除根据可用端口伪造端口数据
      if (options.avaliable) {
        this.avaliable = options.avaliable
      }

      logger.info('DETAIL pileNo = ' + this.pileNo)
    } else {
      wx.showModal({
        title: '提示',
        content: '请扫描正确的二维码',
        showCancel: false,
        success: () => {
          wx.redirectTo({
            url: '/pages/index/index'
          })
        }
      })
    }

    this.setData({
      pageDeep: getCurrentPages().length
    })

  },

  onReady() {

    if (this.checkUserStatus()) {
      logger.debug('检查用户状态: OK')
      this.loadPileInfo()
    } else {
      logger.debug('检查用户状态: NOT OK')
    }
    // 设置初始的8小时




  },
  // 加载桩点信息
  loadPileInfo() {
    //获取桩点详情接口
    http.get({ //充电站详情
      url: "/charge-pile/show",
      requireAuth: true,
      data: {
        // 866710036895701
        pileNo: this.pileNo
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode == 200) {
          var ports = ''
          wx.setStorageSync('curPileId', res.data.id)
          // 存储地名到本地
          wx.setStorageSync('siteName', res.data.siteName)
          wx.setStorageSync("pileNo", res.data.pileNo)
          wx.setStorageSync("pileAddress", res.data.pileAddress)
          wx.setStorageSync("siteAddress", res.data.siteAddress)
          this.pileId = res.data.id
          ports = res.data.ports
          // !!!!造假端口状态
          if (this.avaliable) {
            // 已占用端口
            var busy = 10 - this.avaliable
            // 随机索引来设置端口状态
            var arr_4 = new Array()
            switch (busy) {
              case 0:
                break;
              case 1:
                arr_4 = [1]
                break;
              case 2:
                arr_4 = [1, 4]
                break;
              case 3:
                arr_4 = [2, 4, 7]
                break;
              case 4:
                arr_4 = [0, 3, 6, 9]
                break;
              default:
            }

            // 根据随机的索引设置状态
            for (var k = 0; k < arr_4.length; k++) {
              ports[arr_4[k]].status = 2
            }

          }
          // !!!!-----------造假端口状态结束
          // 给options添加
          for (var p = 0; p < res.data.options.length; p++) {
            res.data.options[p].hour = res.data.options[p].hour + '小时'
          }
          // 设置初始化的充电金额 余额抵扣


          this.setData({
            Chargingpile: ports,
            timelength: res.data.options,
            pileNo: res.data.pileNo,
            balance: res.data.balance
          })
          this.initmoney(res.data.options, res.data.balance)

          // 根据返回选择端口样式类名
          this.setData({
            chargingWrapper: 'chargingWrapper' + res.data.ports.length,
            chargingTimeWrapper: 'chargingTimeWrapper' + res.data.options.length
          })
        } else if (res.statusCode == 404) {
          // 调试真机请求
          wx.showModal({
            title: '提示',
            content: '该桩未上线',
            showCancel: false,
            success: () => {
              wx.redirectTo({
                url: '/pages/index/index'
              })
            }
          })
        } else {
          logger.error('CHARGE/DETAIL请求桩信息: statusCode = ' + res.statusCode)
        }
      }
    })
  },

  // init初始化的充电金额充电抵扣
  initmoney(options, balance) {

    let price = options[this.data.timeAndPriceIndex].price;

    if (price <= balance) {
      this.setData({
        timePrice: price / 100,
        minusWallet: price / 100
      })
    } else {
      this.setData({
        timePrice: price / 100,
        minusWallet: this.data.balance / 100
      })
    }

    this.hour = options[this.data.timeAndPriceIndex].hour;
    this.hour = parseInt(this.hour)

  },

  // 检查用户状态
  checkUserStatus() {
    logger.debug('检查用户状态..')
    if (!auth.authorized()) {
      let redirect_url = encodeURIComponent('/pages/charge/detail/index?scene=' + this.pileNo)
      wx.redirectTo({
        url: `/pages/authorization/index?redirect_url=${redirect_url}`
      })
      return false
    }
    return true
  },

  // ----自定义事件----
  ontapPort(e) { //点击充电端口事件
    var curindex = e.currentTarget.dataset.chargingindex;
    var status = e.currentTarget.dataset.status;
    var port = e.currentTarget.dataset.port; //记录端口
    if (status !== '1') { //空闲才能通过
      return false
    }
    this.setData({
      curindex: curindex
    })
    this.sendport = port
    this.isTapPort = true
  },

  // 这个方法先注释修改删除
  // ontapTime(e) { //选择时长事件
  // 	var curindex = e.currentTarget.dataset.timeindex;
  //   var price = e.currentTarget.dataset.price;
  // 	if (price == null){
  // 		return 
  // 	}
  // 	console.log(price) // 处理价格

  // 	if (price <= this.data.balance) {
  // 		this.setData({
  // 			timePrice: price / 100,
  // 			minusWallet: price / 100
  // 		})
  // 	} else {
  // 		this.setData({
  // 			timePrice: price / 100,
  // 			minusWallet: this.data.balance / 100
  // 		})
  // 	}
  // 	var hour = e.currentTarget.dataset.hour;
  // 	this.hour = hour
  // 	this.setData({
  // 		curtimeindex: curindex
  // 	})
  // 	this.isTapTime = true


  // },

  bindtimeChange(e) {
    // 拿到选中的索引
    console.log(e.detail.value)
    this.setData({
      timeAndPriceIndex: e.detail.value
    })
    let price = this.data.timelength[e.detail.value].price;
    if (price <= this.data.balance) {
      this.setData({
        timePrice: price / 100,
        minusWallet: price / 100
      })
    } else {
      this.setData({
        timePrice: price / 100,
        minusWallet: this.data.balance / 100
      })
    }
    this.hour = this.data.timelength[e.detail.value].hour
    this.hour = parseInt(this.hour)
    this.setData({
      isTapTime: true
    })

  },

  startCharge(e) { // 立即充电事件
    // 添加formId
    console.log(e.detail.formId)
    var status = app.getChargeStatus()
    console.log('status =' + status)
    if (status != constant.NO_CHARGING && status != constant.CHARG_FINISH) {
      wx.showToast({
        title: '不可重复充电',
        icon: 'none'
      })
      return false
    }
    app.resetChargeStatus()
    if (!this.isTapPort) {
      wx.showToast({
        title: '请选择充电端口',
        icon: 'none'
      })
      return false
    }
    if (!this.data.isTapTime) {
      wx.showToast({
        title: '请选择充电时长',
        icon: 'none'
      })
      return false
    }
    console.log(this.sendport, '发送的端口')
    console.log(this.hour, '时长')
    // 把端口时长信息存储到本地
    wx.setStorageSync('curPileTimeInfo', {
      port: this.sendport,
      hour: this.hour,
    })
    //支付接口
    http.post({
      url: `/charge-pile/start/${this.pileId}`,
      requireAuth: true,
      showLoading: true,
      loadingText: '请稍等',
      data: {
        port: this.sendport,
        hour: this.hour,
        wxAppFormId: e.detail.formId
      },
      success: (res) => {
        console.log(JSON.stringify(res) + '148行')
        let data = res.data
        if (res.statusCode === 200) {
          // 根据status状态判断
          switch (data.status) {
            case -1: // 设备未响应
            case 2: // 端口故障		
            case 3: // 端口被占用选择时已处理选不到						
            case 11: // 微信支付请求失败
              wx.showModal({
                title: res.data.message,
                showCancel: false,
                content: '',
              })
              break;
            case 0: // 等待负载
              this.recordId = data.recordId
              app.updateChargeStatus(constant.WAIT_CHARGE)
              this.startListenAndGotoChargeControlPage()
              break;
            case 1: // 直接充电
              this.recordId = data.recordId
              app.updateChargeStatus(constant.CHARGING)
              this.startListenAndGotoChargeControlPage()
              break;
            case 10: // 没有余额或者微信去支付充电
              this.recordId = data.recordId
              this.startPay(data.payInfo)
              break
          }
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

  // 微信支付事件
  startPay(payInfo) {
    wx.requestPayment({
      'timeStamp': payInfo.timestamp,
      'nonceStr': payInfo.noncestr,
      'package': payInfo.packageValue,
      'signType': payInfo.signType,
      'paySign': payInfo.sign,
      'success': (res) => {
        console.log(res, 'success进来了')
        app.updateChargeStatus(constant.WAIT_NOTICE)
        this.startListenAndGotoChargeControlPage()
      },
      'fail': function(res) {
        wx.showToast({
          title: '您取消了支付',
          icon: 'none'
        })
      }
    })
  },

  // 支付成功或者扣除钱包月跳跳转到充电控制页面
  startListenAndGotoChargeControlPage() {
    app.startListenStompMessage(this.recordId)
    wx.redirectTo({
      url: `../control/index`
    })
  },

  // 跳到余额详情
  navtobalance() {
    wx.navigateTo({
      url: `../balance/index?balance=${this.data.balance}`
    })
  }

})