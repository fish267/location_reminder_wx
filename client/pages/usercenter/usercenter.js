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
        weather: {},
    },
    data: {},
    onLoad: function () {
        var that = this;
        that.setData({
            showModal: false
        });
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
    show_alert_distance: function () {
        var alert_distance = wx.getStorageSync('alert_distance');
        if (!alert_distance) {
            this.setData({
                alert_distance: 1000
            })
        } else {
            this.setData({
                alert_distance: alert_distance
            })
        }
        this.setData({
            showModal: true
        });
    },
    show_collection: function () {
        wx.showToast({
            title: '还在建设',
            icon: 'loading',
            duration: 1000
        })
    },

    show_current_location: function () {
        wx.getLocation({
            type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: function (res) {
                // success
                wx.openLocation({
                    latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
                    longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
                    scale: 22, // 缩放比例
                })
            }
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
    input_finish: function (e) {
        this.setData({
            inputValue: e.detail.value
        });
        console.log('距离设置='+ e.detail.value);
    },
    modal_confirm: function () {
        var alert_distance = this.data.inputValue;
        if(!alert_distance){
            alert_distance = this.data.alert_distance;
        }
        console.log('存入缓存, alert_distance=' + alert_distance);
        wx.setStorageSync('alert_distance', Math.floor(alert_distance));
        this.setData({
            showModal: false
        })
    },
    modal_cancel: function () {
        this.setData({
            showModal: false
        })
    },
    onShareAppMessage: function (res) {
        return {
            title: '到站提醒小程序',
        }
    }
})