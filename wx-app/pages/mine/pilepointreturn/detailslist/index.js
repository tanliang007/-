// pages/mine/pilepointreturn/detailslist/index.js
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		isnull: false,
		loading: false,
		hasMore: false,
		pileearnlist: []
	},
	page: 0,
	deg: 0,
	id:'',	// 列表接口需要的id
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		console.log(options.id)
		this.id = options.id
	},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {
		// 默认渲染第一页
		http.post({
			url: `/charge-pile-sponsor/details/${this.id}`,
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
						pileearnlist: this.data.pileearnlist.concat(res.data)
					})
				}
			}
		})
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

  /**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function () {

	},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onPullDownRefresh: function () {

	},

  /**
   * 页面上拉触底事件的处理函数
   */
	onReachBottom: function () {
		console.log('加载更多')
		if (this.data.loading) return;
		this.setData({ loading: true });
		this.updateRefreshIcon();
		this.page++;
		setTimeout(() => {
			http.post({
				url: `/charge-pile-sponsor/details/${this.id}`,
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
							pileearnlist: this.data.pileearnlist.concat(res.data)
						})
						this.setData({ loading: false });
					}
				}
			})
		}, 100)
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