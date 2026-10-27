const api = require('../../utils/api');

Page({
  data: { user: null, defaultName: '匿名用户' },
  onLoad() { this.setData({ defaultName: '同学' + Math.floor(Math.random() * 9000 + 1000) }); },
  onShow() { const app=getApp(); this.setData({user:app.globalData.user||null}); if(app.globalData.token)api.request('/api/me/profile').then(res=>{if(res.data){app.globalData.user=res.data;wx.setStorageSync('user',res.data);this.setData({user:res.data});}}).catch(()=>{}); },

  login() {
    wx.showLoading({ title: '登录中' });
    api.login().then(res => {
      wx.hideLoading();
      this.setData({ user: res.user || null });
      wx.showToast({ title: '登录成功' });
    }).catch(() => { wx.hideLoading(); wx.showToast({ title: '登录失败', icon: 'none' }); });
  },

  editName() {
    wx.showModal({ title: '修改名字', editable: true, placeholderText: '输入新名字', success: res => {
      if (res.confirm && res.content) this.saveProfile({ nickname: res.content });
    }});
  },

  // Avatar files must be uploaded first; local temporary paths are invisible to other users.
  editAvatar() {
    wx.chooseImage({ count: 1, sizeType: ['compressed'], success: res => {
      const filePath = res.tempFilePaths[0];
      const ext = filePath.includes('.') ? filePath.split('.').pop() : 'jpg';
      wx.showLoading({ title: '上传头像中', mask: true });
      wx.cloud.uploadFile({ cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, filePath })
        .then(upload => this.saveProfile({ avatarUrl: upload.fileID }))
        .catch(() => wx.showToast({ title: '头像上传失败', icon: 'none' }))
        .then(() => wx.hideLoading());
    }});
  },

  saveProfile(change) {
    return api.request('/api/me/profile', 'POST', change).then(res => {
      const app = getApp();
      app.globalData.user = res.data;
      wx.setStorageSync('user', res.data);
      this.setData({ user: res.data });
      wx.showToast({ title: '修改成功' });
      return res;
    }).catch(err => {
      wx.showToast({ title: err && err.message === '所发布内容含违规信息' ? '所发布内容含违规信息' : '修改失败', icon: 'none' });
      throw err;
    });
  },

  logout() {
    const app = getApp();
    app.globalData.token = '';
    app.globalData.user = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('user');
    this.setData({ user: null });
    wx.showToast({ title: '已退出登录' });
  },

  showPosts() { if (!this.data.user) return this.login(); wx.navigateTo({ url: '/pages/my-posts/my-posts' }); },
  showComments() { wx.navigateTo({ url: '/pages/my-comments/my-comments' }); },
  showReplies() { wx.navigateTo({ url: '/pages/my-comments/my-comments?replies=1' }); },
  verify() { wx.showModal({ title: '校园认证', content: '校园认证功能暂未完善', showCancel: false }); }
});
