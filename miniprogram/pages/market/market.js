const api = require('../../utils/api');
const { collegeOptions } = require('../../utils/campuses');

Page({
  data: {
    active: '',
    campus: '',
    college: '',
    collegeOptions: ['全部学院'],
    posts: [],
    loading: false,
    search: '',
    showTop: false,
    sections: [
      { code: '', name: '全部内容', icon: '' },
      { code: 'second_hand', name: '二手市场', icon: '/assets/icons/second-hand.png' },
      { code: 'part_time', name: '兼职发布', icon: '/assets/icons/part-time.png' },
      { code: 'lost_found', name: '失物寻物', icon: '/assets/icons/lost-found.png' },
      { code: 'help', name: '打听求助', icon: '/assets/icons/help.png' },
      { code: 'rental', name: '生活指南', icon: '/assets/icons/rental.png' },
      { code: 'carpool', name: '校内拼车', icon: '/assets/icons/carpool.png' },
      { code: 'notice', name: '公示栏', icon: '/assets/icons/help.png' }
    ]
  },

  onLoad() { this.loadPosts(); },
  onShow() { this.loadPosts(); },
  onPageScroll(e) { this.setData({ showTop: e.scrollTop > 500 }); },
  backTop() { wx.pageScrollTo({ scrollTop: 0, duration: 250 }); },

  choose(e) {
    this.setData({ active: e.currentTarget.dataset.code }, () => this.loadPosts());
  },

  // Changing campus resets college because each campus has a different list.
  chooseCampus(e) {
    const campus = e.currentTarget.dataset.campus;
    this.setData({ campus, college: '', collegeOptions: collegeOptions(campus) }, () => this.loadPosts());
  },

  chooseCollege(e) {
    const selected = this.data.collegeOptions[e.detail.value];
    this.setData({ college: selected === '全部学院' ? '' : selected }, () => this.loadPosts());
  },

  inputSearch(e) { this.setData({ search: e.detail.value }); },
  search() {
    const keyword = this.data.search.trim();
    if (keyword) wx.navigateTo({ url: '/pages/search/search?q=' + encodeURIComponent(keyword) });
  },

  loadPosts() {
    this.setData({ loading: true });
    let url = '/api/posts?page=1&pageSize=20&group=MARKET&sort=new';
    if (this.data.active) url += '&board=' + encodeURIComponent(this.data.active);
    if (this.data.campus) url += '&campus=' + encodeURIComponent(this.data.campus);
    if (this.data.college) url += '&college=' + encodeURIComponent(this.data.college);

    api.request(url)
      .then(res => { const posts=(res.data||[]).filter(item=>!this.data.college||item.college===this.data.college); this.setData({posts,loading:false}); })
      .catch(() => this.setData({ posts: [], loading: false }));
  },

  openPost(e) {
    wx.navigateTo({ url: '/pages/post-detail/post-detail?id=' + e.currentTarget.dataset.id });
  },

  publish() {
    if (!getApp().globalData.token) {
      return wx.showModal({
        title: '请先登录', content: '登录后才能发布帖子', confirmText: '去登录',
        success: res => { if (res.confirm) wx.switchTab({ url: '/pages/profile/profile' }); }
      });
    }
    wx.navigateTo({ url: '/pages/publish/publish?group=MARKET' });
  }
});
