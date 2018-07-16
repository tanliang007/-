//index.js
//获取应用实例
const app = getApp()
const http = require('../../utils/http.js')
const controls = require('./controls.js')
const client = require('../../utils/client.js')
const constant = require('../../utils/constant.js')
const auth = require('../../utils/auth.js')
const controls_ScanId = 1
const controls_service = 2
const controls_positioning = 3
const controls_collect = 5
const controls_agent = 6
const controls_robed = 7
const controls_redbao = 8
const logger = require('../../utils/logger.js')

Page({

    data: {
        searchhint: true, // 搜索文字样式			
        searchRes: '搜索附近充电桩', // 附近地址视图
        avatarUrl: '', // 用户头像		
        controls: controls, // 地图控件
        longitude: '', // 当前位置经度
        latitude: '', // 当前位置纬度
        markers: [], // 充电桩的标记点
        condition: false, // 控制点击地图之后的markers的显示
        tapSiteDeail: '', // 站点浮框数据		

        space: 0, // 跑马灯两端文字之间的距离		
        abc: 0,
        title: '我要当桩主!限时抢桩主名额,每个充电桩发放10个.',
        size: 14,
        w: 400
    },

    mapCtx: null, // 地图组件
    isBtnclicked: false,
    isApplyagentBtnClicked: false, // 防止弹出多次页面
    /////////// 生命周期 ///////////////////////////

    onLoad: function(options) {
        // test 页面	
        this.mapCtx = wx.createMapContext('map')
    },

    onReady() {
        this.mapCtx = wx.createMapContext('map')
        this.moveToCurrentLocation()
        this.renderMarkers()
    },

    onShow() {
        this.checkUserSetting()
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#24c771'
        })
        let status = app.getChargeStatus()
        if (status != constant.CHARGING || status != constant.WAIT_CHARGE) {
            this.setData({ 'controls[0].iconPath': '../../icons/scan.png' })
        }
        app.registeChargeStatusCallback(constant.CHARGING, () => {
            this.setData({ 'controls[0].iconPath': '../../icons/zhengzaichongdian@3x.png' })
        })
        app.registeChargeStatusCallback(constant.WAIT_CHARGE, () => {
            this.setData({ 'controls[0].iconPath': '../../icons/zhengzaichongdian@3x.png' })
        })
        app.registeChargeStatusCallback(constant.CHARG_FINISH, () => {
            this.setData({ 'controls[0].iconPath': '../../icons/zhengzaichongdian@3x.png' })
        })
        app.registeChargeStatusCallback(constant.CHARG_SUSPEND, () => {
                this.setData({ 'controls[0].iconPath': '../../icons/zhengzaichongdian@3x.png' })
            })
            // 跑马灯效果
        this.marquee()
    },

    onHide() {
        clearInterval(this.timeid)
    },

    onUnload() {
        clearInterval(this.timeid)
    },

    /////////小程序事件////////////

    // 地图控件点击事件
    onControlTap(e) {
        if (this.isSaoclicked) {
            return
        }
        this.isSaoclicked = true
        setTimeout(() => {
            this.isSaoclicked = false
        }, 1000)
        switch (e.controlId) {
            case controls_ScanId: //扫码充电
                var status = app.getChargeStatus()
                console.log(status + '//扫码充电状态')
                if (status == constant.CHARGING || status == constant.WAIT_CHARGE || status == constant.CHARG_FINISH) {
                    wx.navigateTo({ url: '../charge/control/index' })
                } else {
                    wx.scanCode({
                        success: (res) => {
                            var path = res.path

                            if (path && path.indexOf('pages/charge/detail/index?scene=') >= 0) {
                                wx.navigateTo({
                                    url: '/' + path
                                })
                            } else {
                                wx.showToast({ title: '请扫正确的小程序码', icon: 'none' })
                            }
                        }
                    })
                }
                break
            case controls_service:
                wx.navigateTo({ url: './here-service/index' })
                break
            case controls_agent: //申请代理商

                if (!this.isApplyagentBtnClicked) {
                    this.isApplyagentBtnClicked = true

                    // 代理商状态
                    http.get({
                        url: '/user/brief-info',
                        requireAuth: true,
                        success: res => {
                            if (res.statusCode == 200) {
                                console.log(res, '61')
                                if (res.data.agentId || res.data.agentId == 0) {
                                    console.log('代理商')
                                    if (res.data.agentStatus == 1) { //审核通过站点管理页面
                                        //成为代理商存储到本地
                                        wx.setStorageSync('user-info', res.data);
                                        if (!this.isBtnclicked) {
                                            wx.navigateTo({ url: '../sites/index' })
                                            this.isBtnclicked = true
                                            setTimeout(() => {
                                                this.isBtnclicked = false
                                            }, 1000)
                                        }
                                    } else if (res.data.agentStatus == 0) { //申请中,跳完成请等待页面
                                        console.log('申请中')
                                        wx.navigateTo({
                                            url: '/pages/apply/complete/index'
                                        })
                                    } else if (res.data.agentStatus == 2) { // 审核拒绝					
                                        wx.showToast({
                                            title: '审核没通过',
                                            icon: "none",
                                            duration: 900
                                        })
                                        setTimeout(()=>{
																					wx.navigateTo({
																						url: '/pages/apply/master/index' // 创建个人或者企业桩主
																					})
																				},1000)
                                    }
                                } else { // 第2次往后进来不是代理商
                                    console.log('创建个人或者企业桩主')
                                    wx.navigateTo({
                                        url: '/pages/apply/master/index' // 创建个人或者企业桩主
                                    })
                                }

                            } else {
                                console.log(res.data)
                                    // 没有注册用户可以过去
                                wx.navigateTo({
                                    url: '/pages/apply/master/index' // 创建个人或者企业桩主
                                })
                            }
                        }
                    });

                    setTimeout(() => {
                        this.isApplyagentBtnClicked = false
                    }, 1000)
                }
                break
            case controls_positioning: //定位按钮
                console.log('moveToLocation触发了')
                this.mapCtx.moveToLocation()
                this.positioning = true
                break
            case controls_collect: // 收藏按钮
                wx.showToast({ title: '敬请期待', icon: 'none' })
                break
            case controls_robed: // 抢桩按钮
                wx.navigateTo({ url: './rob-pileguide/index' })
                    // wx.showToast({ title: '敬请期待', icon: 'none' })
                break
            case controls_redbao: // 红包按钮
                wx.navigateTo({ url: '../mine/topup/index' })
                break
            default:
        }
    },

    onRegionChanged(e) { // 拖动地图事件
        if (e.type == 'end') {
            this.renderMarkers()
            this.setData({ condition: false })
        }
    },

    markertap(e) { // 点击标记事件
        console.log(e);
        // 变大mark换图片
        var array = this.data.markers;
        for (var i = 0; i < array.length; i++) {
            var tapmark = array[i];
            if (tapmark.id === e.markerId) {
                tapmark.iconPath = '../../icons/chongdian.png'
                tapmark.width = 50
                tapmark.height = 50
                    //显示充电桩信息
                wx.getLocation({ //获取当前经纬
                    type: 'wgs84',
                    success: (res) => {
                        this.showbox(e.markerId, res.longitude, res.latitude)
                    }
                })
            } else {
                tapmark.width = 30
                tapmark.height = 30
            }
        }

        this.setData({
            markers: array
        })

    },

    maptap() { //地图点击事件
        this.setData({
            condition: false
        })

        var array = this.data.markers;
        for (var i = 0; i < array.length; i++) {
            var tapmark = array[i];
            tapmark.width = 30
            tapmark.height = 30
        }

        this.setData({
            markers: array
        })

    },

    // 自定义事件
    moveToCurrentLocation(e) {

        wx.getLocation({ // 防止灰色地图出现
            type: '',
            success: res => {
                console.log(res, '地理授权202行')
                this.setData({
                    longitude: res.longitude, // 当前位置经度
                    latitude: res.latitude,
                })
            }
        })

    },

    // 在地图上渲染充电桩标记点
    renderMarkers() {
        var array = [];
        this.mapCtx.getCenterLocation({
            success: res => {
                console.log(res.longitude, '213')
                console.log(res.latitude, '214')
                http.get({
                    url: '/charge-site/index',
                    data: {
                        longitude: res.longitude,
                        latitude: res.latitude, // 已上线id
                        radius: 50000 //	接口更新后需要传这个参数了 
                    },
                    success: (res) => {
                        if (res.statusCode === 200) {
                            console.log(res.data, '666666666')
                                //设置站点markers
                            res.data.forEach((element) => {
                                var obj = Object.assign(element, {
                                    iconPath: "../../icons/chongdian.png",
                                    width: 30,
                                    height: 30
                                })
                                array.push(obj)
                            })
                            console.log(array, '----充电站markers')
                            this.setData({ markers: array })
                            if (this.positioning) {
                                wx.showToast({
                                    title: `附近有${this.data.markers.length}个站点`,
                                    icon: 'none'
                                })
                            }
                            this.positioning = false
                        } else {
                            wx.showToast({ title: res.data, icon: 'none' })
                        }
                    }
                })

            }
        })
    },

    searchNearby() {
        // 跳转到附近充电桩搜索页面
        wx.navigateTo({
            url: './near-pites/index'
        })
    },

    // 跳转个人中心
    navpersoncenter() {
        wx.navigateTo({
            url: '../mine/index',
        })
    },

    // 渲染点击站点气泡弹出的盒子
    showbox(id, longitude, latitude) {
        console.log('渲染点击站点气泡弹出的盒子')
        http.post({
            url: `/charge-site/show/${id}`,
            data: {
                longitude: longitude,
                latitude: latitude
            },
            success: (res) => {
                console.log(res, '')
                if (res.statusCode === 200) {
                    this.setData({
                        tapSiteDeail: res.data,
                        condition: true
                    })
                } else {
                    wx.showToast({
                        title: res.data,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },

    navTositedetail(e) { // 跳转站点详情
        const siteId = e.currentTarget.dataset.siteid
        wx.navigateTo({ url: './site-detail/index?siteId=' + siteId })
    },

    //调外部地图导航
    navToSite() {
        console.log(this.data.tapSiteDeail)
        const tapsiteinfo = this.data.tapSiteDeail
        wx.openLocation({
            latitude: tapsiteinfo.latitude,
            longitude: tapsiteinfo.longitude,
            scale: 28
        })
    },

    // 跑马灯效果轮播
    marquee() {
        // 初始化space
        var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
        if (this.data.w < windowWidth) {
            this.setData({
                space: windowWidth - this.data.w
            })
        } else {
            this.setData({
                space: 60
            })
        }
        // 如果文字滚白边，就接着显示
        this.timeid = setInterval(() => {
            this.data.abc -= 2
            this.setData({
                abc: this.data.abc
            })
            if (Math.abs(this.data.abc) > (this.data.w + this.data.space)) {
                this.setData({
                    abc: 0
                })
            }
        }, 100)


    },

    // 查询用户设置
    checkUserSetting() {
        if (!auth.authorized()) {
            wx.redirectTo({ url: '/pages/authorization/index' })
            return
        }
        // 查看是否授权
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success: (res) => {
                            app.setAvatarAndName({
                                avatarUrl: res.userInfo.avatarUrl,
                                nickName: res.userInfo.nickName
                            })
                            this.setData({
                                avatarUrl: res.userInfo.avatarUrl
                            })
                        }
                    })
                } else {
                    // 直接跳转到权限页
                    wx.redirectTo({ url: '/pages/authorization/index' })
                }
            }
        })
    },

    onShareAppMessage() {

    }

})