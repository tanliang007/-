// pages/site-create/index.js
const http = require('../../../utils/http.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pricerange: '', // 电费picker数组
        sitename: '', // 站点视图
        hassiteaddr: false, // 控制站点地址显示
        pricePerHour: '', // 新建价格参数
        switchadmin: false, // 切换管理员视图
        landFeeRate: '',
        landowner: ''
    },
    longitude: '', // 新建经度参数
    latitude: '', // 新建维度参数
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            pricerange: this.makepricerange()
        })
    },

    // 页面方法
    makepricerange() { //造数组
        var i = 0
        var arr = []
        while (i <= 2) {
            i += 0.1
            var a = i.toFixed(1)
            arr.push(a)
        }
        return arr
    },

    // 选择站点地址
    chooseSiteAddr() {
        wx.chooseLocation({
            success: (res) => {
                console.log(res)
                let name = res.name
                let address = res.address

                // 包含 && （address 不含字符'省' && address 不已以下字符开头：
                // console.log(flag)
                if (address.indexOf(name) >= 0 && address.indexOf('省') < 0 && !['北京', '广西壮族自治区', '内蒙古自治区', '宁夏回族自治区', '上海', '天津', '西藏自治区', '新疆维吾尔自治区', '重庆', '香港特别行政区', '澳门特别行政区'].some(function(v) {
                        return address.indexOf(v) == 0
                    })) {
                    wx.showToast({
                        title: '请选择省市区详细地址格式的地址',
                        icon: 'none'
                    })
                    this.setData({
                        siteaddr: '', //视图	
                        hassiteaddr: false
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

    // 小程序事件
    // bindPowerChange(e) {
    // 	console.log(e)
    // 	this.setData({
    // 		showPricePerHour: this.data.pricerange[e.detail.value]
    // 	})
    // 	this.pricePerHour = parseInt(this.data.pricerange[e.detail.value] * 100)

    // },

    switchChange(e) { // 切换是否添加管理员
        console.log('switch1 发生 change 事件，携带值为', e.detail.value)
        this.setData({
            switchadmin: e.detail.value,
            landowner: '',
            landFeeRate: ''
        })
    },

    // 表单提交
    formSubmit(e) {
        var reg = /\s+/g
        var formdata = e.detail.value
            // formdata.pricePerHour = this.pricePerHour
            //表单验证
        if (formdata.name === '' || reg.test(formdata.name)) {
            wx.showToast({
                title: '请填写站点名称',
                icon: 'none',
                duration: 1000
            })
            console.log('请填写名称')
            return false
        }

        if (formdata.fullAddress === '') {
            wx.showToast({
                title: '请选择站点地址',
                icon: 'none',
                duration: 1000
            })
            console.log('请选择站点地址')
            return false
        }
        var reg = /^0{1}([.]\d{1,2})?$|^[1-9]\d*([.]{1}[0-9]{1,2})?$/
        if (!reg.test(formdata.pricePerHour)) {
            wx.showToast({
                title: '计费格式不正确',
                icon: 'none',
                duration: 1000
            })
            return false
        } else if (formdata.pricePerHour > 3) {
            wx.showToast({
                title: '计费范围不正确',
                icon: 'none',
                duration: 1000
            })
            return false
        }

        // 如果有管理员做如下判断
        if (this.data.switchadmin) {
            var reg = /^(?:0|[1-9][0-9]?|99)$/;

            // 临时注释:18556739726管理员
            if (formdata.landowner === '' || !/^1\d{10}$/.test(formdata.landowner)) {
                wx.showToast({
                    title: '管理员联系方式不正确',
                    icon: 'none',
                    duration: 1000
                })
                return false
            }
            console.log(formdata)
            if (formdata.landFeeRate == "" || !reg.test(formdata.landFeeRate)) {
                wx.showToast({
                    title: '请输入0到99整数',
                    icon: 'none'
                })
                return false
            } else {
                formdata.landFeeRate = formdata.landFeeRate / 100
            }
        }
        // 选择地点的经纬度和价格添加到表单数据中
        formdata.longitude = this.longitude
        formdata.latitude = this.latitude
        formdata.pricePerHour = parseFloat(formdata.pricePerHour) * 100
        console.log(formdata)
            // 新建充电站点接口
        http.post({
            url: '/charge-site/save',
            requireAuth: true,
            data: formdata,
            showLoading: true,
            success: (res) => {
                if (res.statusCode === 200) {
                    wx.showModal({
                        title: '充电站创建成功',
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
    }

})