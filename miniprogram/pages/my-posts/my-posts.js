const api = require('../../utils/api');

Page({
  data: { posts: [], loading: true },
  onLoad() { this.load(); },
  onShow() { this.load(); },

  load() {
    this.setData({ loading: true });
    api.request('/api/me/posts?page=1&pageSize=50')
      .then(res => this.setData({ posts: res.data || [], loading: false }))
      .catch(() => {
        this.setData({ posts: [], loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  open(e) {
    wx.navigateTo({ url: '/pages/post-detail/post-detail?id=' + e.currentTarget.dataset.id });
  },

  deletePost(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除帖子',
      content: '删除后无法恢复，确定删除吗？',
      success: res => {
        if (!res.confirm) return;
        wx.showLoading({ title: '删除中', mask: true });
        api.request('/api/posts/' + id, 'DELETE')
          .then(() => {
            wx.hideLoading();
            this.setData({ posts: this.data.posts.filter(item => (item.id || item._id) !== id) });
            wx.showToast({ title: '已删除' });
          })
          .catch(() => {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
      }
    });
  }
});