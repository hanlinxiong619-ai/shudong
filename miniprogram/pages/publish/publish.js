const api = require('../../utils/api');
const { collegeOptions } = require('../../utils/campuses');

Page({
  data: {
    group: 'TREEHOLE',
    boardCode: 'vent',
    boardName: '吐槽',
    title: '',
    content: '',
    campus: '花都',
    college: '',
    collegeOptions: collegeOptions('花都'),
    contact: '',
    estimatedPrice: '',
    images: [],
    boards: [],
    submitting: false
  },

  onLoad(options) {
    const group = options.group || 'TREEHOLE';
    const isMarket = group === 'MARKET';
    this.setData({
      group,
      boardCode: isMarket ? 'second_hand' : 'vent',
      boardName: isMarket ? '二手市场' : '吐槽'
    });
    api.request('/api/boards').then(res => {
      this.setData({ boards: (res.data || []).filter(item => item.groupType === group) });
    });
  },

  pick(e) {
    const board = this.data.boards[e.detail.value];
    if (board) this.setData({ boardCode: board.code, boardName: board.name });
  },
  pickCampus(e) {
    const campus = ['花都', '海珠'][e.detail.value];
    this.setData({ campus, college: '', collegeOptions: collegeOptions(campus) });
  },
  pickCollege(e) {
    const selected = this.data.collegeOptions[e.detail.value];
    this.setData({ college: selected === '全部学院' ? '' : selected });
  },
  inputTitle(e) { this.setData({ title: e.detail.value }); },
  inputContent(e) { this.setData({ content: e.detail.value }); },
  inputContact(e) { this.setData({ contact: e.detail.value }); },
  inputPrice(e) { this.setData({ estimatedPrice: e.detail.value }); },

  chooseImages() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => this.setData({ images: this.data.images.concat(res.tempFilePaths) })
    });
  },

  // Local temporary paths expire. Upload every selected image before creating the post.
  uploadImages() {
    return Promise.all(this.data.images.map((filePath, index) => {
      if (filePath.startsWith('cloud://')) return Promise.resolve(filePath);
      const ext = filePath.includes('.') ? filePath.split('.').pop() : 'jpg';
      const cloudPath = `posts/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext}`;
      return wx.cloud.uploadFile({ cloudPath, filePath }).then(res => res.fileID);
    }));
  },

  submit() {
    if (this.data.submitting) return;
    if (!this.data.content.trim()) return wx.showToast({ title: '请填写内容', icon: 'none' });

    this.setData({ submitting: true });
    wx.showLoading({ title: this.data.images.length ? '上传图片中' : '发布中', mask: true });
    this.uploadImages()
      .then(images => api.request('/api/posts', 'POST', {
        groupType: this.data.group,
        boardCode: this.data.boardCode,
        title: this.data.title,
        content: this.data.content,
        campus: this.data.campus,
        college: this.data.college,
        contact: this.data.contact,
        estimatedPrice: this.data.group === 'MARKET' && this.data.estimatedPrice ? Number(this.data.estimatedPrice) : null,
        images
      }))
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '发布成功' });
        setTimeout(() => wx.navigateBack(), 500);
      })
      .catch(err => {
        wx.hideLoading();
        this.setData({ submitting: false });
        wx.showToast({ title: err && err.message === '所发布内容含违规信息' ? '所发布内容含违规信息' : '发布失败', icon: 'none' });
      });
  }
});
