const app = getApp()

Page({
    data: {
        aboutUsTitle: '',
        aboutUsContent: '',
        servicePhoneNumber: '',
        balance: 0,
        freeze: 0,
        score: 0,
        score_sign_continuous: 0,
        iconSize: 45,
        iconColor: '#999999',
        element_flag: false
    },
    data: {},
    onLoad: function () {

    },
    show_todo: function () {
        wx.showToast({
            title: '还在建设',
            icon: 'loading',
            duration: 1000
        })
    },
    show_collection: function () {
        wx.showToast({
            title: '还在建设',
            icon: 'loading',
            duration: 1000
        })
    },

    show_current_location: function () {
        wx.showToast({
            title: '还在建设',
            icon: 'loading',
            duration: 1000
        })
    },

    show_author: function () {
        wx.showModal({
            title: '联系',
            content: '联系邮箱: fsh267@gmail.com',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    show_about: function () {
        wx.showModal({
            title: '关于',
            content: '位置提醒小程序',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    show_remark: function () {
        wx.showToast({
            title: '还在建设',
            icon: 'loading',
            duration: 1000
        })
    },

})