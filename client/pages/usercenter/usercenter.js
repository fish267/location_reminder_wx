var config = require('../../libs/config.js');
var amapFile = require('../../libs/amap-wx.js');
var key = config.Config.key;
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
        element_flag: false,
        weather: {}
    },
    data: {},
    onLoad: function () {
        var that = this;
        var myAmapFun = new amapFile.AMapWX({key: key});
        myAmapFun.getWeather({
            success: function (data) {
                that.setData({
                    weather: data.liveData
                });
                console.log('天气数据:' + JSON.stringify(data));
            },
            fail: function (info) {
                // wx.showModal({title:info.errMsg})
            }
        })
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