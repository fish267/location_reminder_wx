Page({
    data: {},
    delete_site_tag: function (e) {
        wx.showModal({
            title: '删除站点',
            content: e.currentTarget.dataset.sitename,
            success: function(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    }
});
