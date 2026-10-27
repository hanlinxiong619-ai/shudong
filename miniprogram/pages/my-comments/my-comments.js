const api = require('../../utils/api');

Page({
  data: { replies: false, items: [], loading: true },
  onLoad(options) {
    const replies = options.replies === '1';
    this.setData({ replies });
    const path = replies ? '/api/me/replies' : '/api/me/comments';
    api.request(path)
      .then(res => this.setData({ items: res.data || [], loading: false }))
      .catch(() => this.setData({ items: [], loading: false }));
  },
  openPost(e) {
    const id = e.currentTarget.dataset.postId;
    if (id) wx.navigateTo({ url: '/pages/post-detail/post-detail?id=' + id });
  }
});