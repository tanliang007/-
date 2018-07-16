// pages/records/index.js
const http = require('../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		isnull:false,
		loading: false,
		hasMore: false,		
		recordList: []
	},
	page: 0,
	deg: 0,
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {
		// 默认渲染第一页
		http.post({
			url: '/charge-record/index',
			requireAuth: true,
			data: {
				page: this.page,
				size: 10,
			},
			success: (res) => {
				if (res.statusCode === 200) {
					console.log(res)
					if (res.data.length === 0) {
						this.setData({ isnull: true });
						return false
					}
					this.setData({
						recordList: this.data.recordList.concat(res.data)
					})
				}
			}
		})

	},
  /**
   * 页面上拉触底事件的处理函数
   */
	onReachBottom: function () {
		console.log('加载更多')
		if (this.data.loading) return;
		this.setData({ loading: true });
		this.updateRefreshIcon();
		this.setData({
			page: ++this.page,
		})
		setTimeout(() => {
			http.post({
				url: '/charge-record/index',
				requireAuth: true,
				data: {
					page: this.page,
					size: 10
				},
				success: (res) => {
					if (res.statusCode === 200) {
						if (res.data.length === 0) {
							this.setData({ hasMore: true });
							this.setData({ loading: false });
							return false
						}
						this.setData({
							recordList: this.data.recordList.concat(res.data)
						})
						this.setData({ loading: false });
					}
				}
			})
		}, 200)
	},

	navToDetai(e){						// 导航到对应记录详情的页面
		console.log(e.currentTarget.dataset.recordid)
		wx.navigateTo({
			url: `./detail/index?recordId=${e.currentTarget.dataset.recordid}&minejump=${false}`,
		})
	},

	// 加载动画
	updateRefreshIcon() {
		console.log('旋转开始了.....')
		var animation = wx.createAnimation({
			duration: 500,
			timingFunction: "linear",
			delay: 0
		});
		var timer = setInterval(() => {
			if (!this.data.loading) {
				console.log(11)
				clearInterval(timer);
			}
	
			this.deg = this.data.deg += 360
			
			animation.rotateZ(this.deg).step();//在Z轴旋转一个deg角度		
			console.log(1)
			this.setData({
				refreshAnimation: animation.export()
			})
		}, 1000);

	}

})