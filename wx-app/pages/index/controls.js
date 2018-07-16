var controls = null
const controls_ScanId = 1
const controls_service = 2
const controls_positioning = 3
const controls_collect = 5
const controls_agent = 6
const controls_robed = 7
const controls_redbao = 8
wx.getSystemInfo({
    success: res => {
        console.log(res);
        //  可使用窗口宽度、高度
        console.log('height=' + res.windowHeight)
        console.log('width=' + res.windowWidth)
            //	计算主体部分高度,单位为px
        controls = [{
                id: controls_ScanId, //  扫码充电按钮
                iconPath: '../../icons/scan.png',
                position: {
                    top: res.windowHeight - 110,
                    left: res.windowWidth / 2 - 71,
                    width: 142,
                    height: 50
                },
                clickable: true
            },
            {
                id: controls_service, //	客服按钮
                iconPath: '../../icons/kefu@3x.png',
                position: {
                    top: 126,
                    left: res.windowWidth - 55,
                    width: 50,
                    height: 50
                },
                clickable: true
            },
            {
                id: controls_positioning, //	定位按钮
                iconPath: '../../icons/focus.png',
                position: {
                    top: res.windowHeight - 103,
                    left: res.windowWidth - 75,
                    width: 50,
                    height: 50
                },
                clickable: true
            },
            {
                id: 4, //	地图中心点按钮
                iconPath: '../../icons/location.png',
                position: {
                    top: (res.windowHeight - 38) / 2 - 33,
                    left: (res.windowWidth - 38) / 2 + 9,
                    width: 21,
                    height: 38
                },
                clickable: true
            },
            {
                id: controls_collect, // 收藏按钮记得换图标
                iconPath: '../../icons/shoucang.png',
                position: {
                    top: res.windowHeight - 103,
                    left: 20,
                    width: 50,
                    height: 50
                },
                clickable: true
            },
            {
                id: controls_agent, // 合作按钮
                iconPath: '../../icons/controls_agent.png',
                position: {
                    top: 26,
                    left: res.windowWidth - 55,
                    width: 50,
                    height: 50
                },
                clickable: true
            },
            {
                id: controls_robed, // 抢桩
                iconPath: '../../icons/controls_robed.png',
                position: {
                    top: 76,
                    left: res.windowWidth - 55,
                    width: 50,
                    height: 50
                },
                clickable: true
            },
            {
                id: controls_redbao, // 红包
                iconPath: '../../icons/honbao@3x.png',
                position: {
                    top: 0,
                    left: 5.5,
                    width: 35,
                    height: 68,
                },
                clickable: true
            },
        ]
    }
})

module.exports = controls