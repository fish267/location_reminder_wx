var amapFile = require('../../libs/amap-wx.js');
var config = require('../../libs/config.js');
var util = require('../../libs/util.js');
var calculate_distance = util.calculate_distance;
var set_markers = util.set_markers;
var key = config.Config.key;
var MARKERS = 'markers';
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {},
        city: '',
        site_tag: [],
        min_width: 400
    },
    // 页面加载时, 获取当前地理位置
    onLoad: function (e) {
        var storage_markers = wx.getStorageSync(MARKERS);
        if (storage_markers) {
            this.setData({
                markers: storage_markers
            });
        }
        // 设置首页元素宽度, 适配机型
        this.setDivWidth();
        this.setCurrentLocation();
    },
    // 设置元素宽度
    setDivWidth: function () {
        var res = wx.getSystemInfoSync()
        console.log('设备信息: ' + JSON.stringify(res));
        var min_width = Math.floor(res.windowWidth);
        this.setData({
            min_width: min_width
        });
        console.log(this.data);
    },
    // 设置当前经纬度地址
    setCurrentLocation: function () {
        var that = this;
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                that.setData({latitude: latitude, longitude: longitude});
                console.log('当前经纬度:' + JSON.stringify(res));
                wx.setStorage({
                    key: 'latitude',
                    data: latitude
                });
                wx.setStorage({
                    key: 'longitude',
                    data: longitude
                });
            },
            fail: function (info) {
                wx.showModal({title: info.errMsg})
            }
        });
    },
    // 设置城市
    onReady: function (e) {
        var that = this;
        var myAmapFun = new amapFile.AMapWX({key: key});
        myAmapFun.getPoiAround({
            success: function (data) {
                //成功回调
                if (data.poisData[0].cityname) {
                    that.setData({city: data.poisData[0].cityname});
                }
            },
            fail: function (info) {
                //失败回调
                console.error(info);
            }
        })
    },


    // 周报站点搜索
    bindInput: function (e) {
        var that = this;
        var keywords = e.detail.value;
        if (keywords == '') {
            return;
        }
        var myAmapFun = new amapFile.AMapWX({key: key});
        myAmapFun.getInputtips({
            keywords: keywords,
            location: that.data.longitude + ',' + that.data.latitude,
            city: that.data.city,
            datatype: 'poi',
            success: function (data) {
                if (data && data.tips) {
                    that.setData({
                        tips: data.tips
                    });
                }
            }
        })
    },
    // 点击站点, 添加到 MARKERS 与缓存
    bindSearch: function (e) {
        var site = e.currentTarget.dataset.site_detail;
        console.log(site);
        var site_list = this.data.markers;
        for (var index = 0; index < site_list.length; index++) {
            if (site_list[index].id == site.id) {
                console.log('该站点已经设置过');
                return;
            }
        }
        var that = this;
        wx.showModal({
            title: '添加站点',
            content: site.name,
            success: function (res) {
                if (res.confirm) {
                    // 设置显示名称与距离
                    var lng1 = site.location.split(',')[0];
                    var lat1 = site.location.split(',')[1];
                    site['site_distance'] = calculate_distance(lat1, lng1,
                        that.data.latitude, that.data.longitude);
                    site_list.push(site);
                    set_markers(that, site_list);
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });

    },

    delete_site_tag: function (e) {
        var that = this;
        var site_id = e.currentTarget.dataset.site_id;
        var site_name = e.currentTarget.dataset.site_name;
        wx.showModal({
            title: '删除站点',
            content: site_name,
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    var site_list = that.data.markers;
                    for (var index = 0; index < site_list.length; index++) {
                        if (site_list[index].id == site_id) {
                            site_list.splice(index, index);
                            console.log('删除站点:' + site_name);
                            set_markers(that, site_list);
                        }
                    }
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },
    switchChange: function () {
        wx.clearStorage();
    }
});
