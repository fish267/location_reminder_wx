var amapFile = require('../../libs/amap-wx.js');
var config = require('../../libs/config.js');
var util = require('../../libs/util.js');
var calculate_distance = util.calculate_distance;
var set_markers = util.set_markers;
var key = config.Config.key;
var MARKERS = 'markers';
var REMIND_DISTANCE = 1000;
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {},
        city: '',
        site_tag: [],
        min_width: 400,
        switch_status: false,
        poped_window: false,
        clear_button_flag: true
    },
    // 页面加载时, 获取当前地理位置
    onLoad: function (e) {
        this.setCurrentLocation();
        var storage_markers = wx.getStorageSync(MARKERS);
        if (storage_markers && storage_markers.length > 0) {
            this.setData({
                markers: storage_markers
            });
        } else {
            this.setData({
                clear_button_flag: false
            })
        }
        // 设置首页元素宽度, 适配机型
        this.setDivWidth();
        // 初始化提醒按钮
        var switch_status = wx.getStorageSync('switch_status');
        if (switch_status) {
            this.setData({
                switch_status: true
            });
        }

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
                // console.log('当前经纬度:' + JSON.stringify(res));
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
        // 设置提醒阈值
        var alert_distance = wx.getStorageSync('alert_distance');
        REMIND_DISTANCE = alert_distance ? alert_distance : 1000;
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
        });
        // 轮询当前位置, 更新距离到缓存
        setInterval(function () {
            var raw_site_list = wx.getStorageSync(MARKERS) ? wx.getStorageSync(MARKERS) : [];
            if (raw_site_list.length == 0) {
                that.setData({
                    clear_button_flag: false
                })
                return;
            } else {
                // 将当前位置放到缓存
                that.setCurrentLocation();
                var longitude = wx.getStorageSync('longitude');
                var latitude = wx.getStorageSync('latitude');
                var site_list = [];
                raw_site_list.forEach(function (item) {
                    var site = Object.assign({}, item);
                    site['site_distance'] = calculate_distance(
                        latitude, longitude, item.latitude, item.longitude
                    );
                    site_list.push(site);
                });
                that.setData({
                    markers: site_list
                });
                that.setData({
                    clear_button_flag: true
                });
                set_markers(that, site_list);
            }
        }, 5000);
        // 轮询设置的站点, 进行弹层抖动提示
        setInterval(function () {
            var raw_site_list = wx.getStorageSync(MARKERS) ? wx.getStorageSync(MARKERS) : [];
            if (raw_site_list.length == 0 || !that.data.switch_status) {
                return;
            } else {
                raw_site_list.forEach(function (item) {
                    var switch_status = wx.getStorageSync('switch_status');
                    if (item.site_distance <= REMIND_DISTANCE && switch_status) {
                        wx.vibrateLong();
                        if (!that.data.poped_window) {
                            wx.showModal({
                                title: '站点提醒',
                                content: '距离' + item.name + item.site_distance + '米',
                                success: function (res) {
                                    that.setData({
                                        switch_status: false,
                                    });
                                    wx.setStorageSync('switch_status', false);
                                }
                            })
                            that.setData({
                                poped_window: true,
                            })
                        }
                    }
                });
            }
        }, 2000);
    },


    // 周报站点搜索
    bindInput: function (e) {
        var that = this;
        var keywords = e.detail.value;
        if (keywords == '') {
            that.setData({
                tips: []
            });
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
                    console.log("站点查询:" + JSON.stringify(data));
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
                    site.latitude = lat1;
                    site.longitude = lng1;
                    // 当前模式, 无法获取站点类型
                    site.type = '生活服务';
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
                    var ret_list = [];
                    for (var index = 0; index < site_list.length; index++) {
                        if (site_list[index].id == site_id) {
                            console.log('删除站点:' + site_name);
                        } else {
                            ret_list.push(site_list[index]);
                        }
                    }
                    set_markers(that, ret_list);
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },
    switchChange: function (e) {
        console.log('switchChange 事件，值:', e.detail.value);
        var that = this;
        if (e.detail.value) {
            this.setData({
                switch_status: true,
                poped_window: false
            });
        } else {
            this.setData({
                switch_status: false
            });
        }
        wx.setStorage({
            key: 'switch_status',
            data: e.detail.value,
        });

    },
    clear_site: function () {
        var that = this;
        if (this.data.markers.length == 0) {
            return;
        }
        wx.showModal({
            title: '提醒',
            content: '清空所有站点?',
            success: function (res) {
                if (res.confirm) {
                    that.setData({
                        markers: []
                    });
                    set_markers(that, []);
                    console.log('用户点击确定')
                }
            }
        });
    }
});
