// pages/pile-create/index.js
const http = require('../../../utils/http.js')
const utils = require('../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pileNo: '', // 桩点编号扫码		
        imei: '', // 模块编号扫码
        siteId: '', // 传递过来的siteId
        portrange: ['3路', '5路', '8路', '10路'], // 端口数范围
        showport: '', // 展示端口路数		
        portCount: '', // 传给后台端口	 	
        siteaddr: '', // 是否有地址
        signal: '', // 切换信号背景值
        signalinfo: '' // 信号强弱文字描述
    },
    signalarr: ['无信号', ' 很差', '较差', '一般', '良好', '很好'], // 信号状况
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        this.sitelatitude = options.sitelatitude
        this.sitelongitude = options.sitelongitude
        this.siteId = options.siteId
    },

    // ---- 小程序事件 ----
    bindportChange(e) { // 选择端口事件
        const portrange = (this.data.portrange)[e.detail.value]
        var portCount = Number(portrange.replace(/[^0-9]/ig, ""))
        this.setData({
            portCount: portCount, //视图
            showport: portrange //传递
        })

    },

    newPointSao() { // 扫描桩点编号		
        wx.scanCode({
            success: (res) => {
                console.log(res);
                var path = res.path
                var makey = path.substring(path.indexOf('?') + 1, path.length)
                this.setData(({
                    pileNo: makey.substring(makey.indexOf('=') + 1, makey.length)
                }))
            }
        })
    },

    newModeNumSao() { // 扫描模块编号
        wx.scanCode({
            success: (res) => {

                // 处理字符串
                var arr = res.result.split(';')
                var n = "";
                console.log(arr)
                arr.forEach(function(v, i) {
                    if (v.split(':')[0] == "IMEI") {
                        n = v.split(':')[1]
                    }
                })
                console.log(n)
                    // 查询信号强度使用的变量
                this.querySignalimei = n
                this.setData(({
                    imei: n
                }))
            }

        })
    },

    formSubmit(e) {
        console.log('*******************')
        var reg = /\s+/g
        var submitData = e.detail.value
        submitData.siteId = this.siteId
        submitData.portCount = this.data.portCount
        console.log(submitData)
            //表单验证
        if (submitData.pileNo.replace(/\s/g, '') === '') {
            wx.showToast({
                title: '请填写充电桩编号',
                icon: 'none',
                duration: 1000
            })
            console.log('请填写充电桩编号')
            return false
        }
        if (submitData.imei.replace(/\s/g, '') === '') {
            wx.showToast({
                title: '请填写模块编号',
                icon: 'none',
                duration: 1000
            })
            console.log('请填写模块编号')
            return false
        }

        if (submitData.portCount === '' || reg.test(submitData.portCount)) {
            wx.showToast({
                title: '请选择端口路数',
                icon: 'none',
                duration: 1000
            })
            console.log('请选择端口路数')
            return false
        }
        if (this.data.siteaddr == '') {
            wx.showToast({
                title: '请选择站点地址',
                icon: 'none',
                duration: 1000
            })
            console.log('请选择站点地址')
            return false
        }
        console.log(submitData)
        submitData.location = submitData.location.replace(/\s/g, '')
        if (submitData.location == '') {
            wx.showToast({
                title: '请填写位置描述',
                icon: 'none'
            })
            console.log('请填写位置描述')
            return false
        }
        //新建站点下的桩点接口
        submitData.longitude = this.longitude
        submitData.latitude = this.latitude
        console.log(submitData)
            // 新建充点桩接口
        http.post({
            url: '/charge-pile/save',
            requireAuth: true,
            showLoading: true,
            data: submitData,
            success: (res) => {
                console.log(res)
                if (res.statusCode === 200) {
                    wx.showModal({
                        title: '充电桩创建成功',
                        content: '',
                        showCancel: false,
                        success: () => {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })
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

    // 选择站点地址
    chooseSiteAddr() {
        wx.chooseLocation({
            success: (res) => {
                console.log(res)
                let name = res.name
                let address = res.address
                    // 判断超过站点三公里不赋值
                console.log(utils.shortDistance(parseFloat(this.sitelongitude), parseFloat(this.sitelatitude), res.longitude, res.latitude))
                if (utils.shortDistance(parseFloat(this.sitelongitude), parseFloat(this.sitelatitude), res.longitude, res.latitude) > 3000) {
                    wx.showToast({
                        title: '请不要选择超过站点三公里的地方',
                        icon: 'none'
                    })
                    return
                }
                this.setData({
                    name: name, //站点名称
                    siteaddr: address, //视图	
                    hassiteaddr: true
                })
                this.latitude = res.latitude,
                    this.longitude = res.longitude
            }
        })
    },
    // 查询信号强度事件
    querySignal() {
        console.log(this.querySignalimei)
        http.get({
            url: '/charge-pile/signal',
            data: {
                imei: this.querySignalimei
            },
            showLoading: true,
            success: (res) => {
                console.log(this.signalarr[res.data.signal])
                this.setData({
                    signal: res.data.signal,
                    signalinfo: this.signalarr[res.data.signal]
                })
            }
        })
    },

    getinpuimei(e) {
        this.querySignalimei = e.detail.value
        console.log(this.querySignalimei)
    }
})