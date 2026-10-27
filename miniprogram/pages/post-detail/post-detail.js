const api = require('../../utils/api');

Page({
  data: {
    post: null,
    comments: [],
    loading: true,
    submittingComment: false,
    commentText: '',
    replyTarget: null,
    scrollIntoView: ''
  },

  onLoad(options) { this.load(options.id); },

  load(id) {
    this.setData({ loading: true });
    return api.request('/api/posts/' + id)
      .then(res => { this.setData({ post: res.data }); return api.request('/api/posts/' + id + '/comments'); })
      .then(res => this.setData({ comments: this.arrangeComments(res.data || []), loading: false }))
      .catch(() => { this.setData({ loading: false }); wx.showToast({ title: '加载失败', icon: 'none' }); });
  },

  // Keep every reply directly below its root comment while preserving reply targets.
  arrangeComments(comments) {
    const byId = {}; comments.forEach(item => { byId[item.id || item._id] = item; });
    const rootId = item => { let current=item, seen={}; while(current.parentId&&byId[current.parentId]&&!seen[current.parentId]){seen[current.parentId]=true;current=byId[current.parentId];} return current.id||current._id; };
    const roots=comments.filter(item=>!item.parentId||!byId[item.parentId]);
    const ordered=[]; roots.forEach(root=>{ordered.push(root);comments.forEach(item=>{if(item!==root&&rootId(item)===(root.id||root._id))ordered.push(item);});});
    return ordered;
  },

  // Update immediately in the UI; CloudBase persistence happens in the background.
  like() {
    if (!getApp().globalData.token) return wx.showToast({ title: '请先登录', icon: 'none' });
    const id = this.data.post.id || this.data.post._id;
    const previous = this.data.post;
    const liked = !previous.liked;
    this.setData({ post: Object.assign({}, previous, { liked, likeCount: Math.max(0, Number(previous.likeCount || 0) + (liked ? 1 : -1)) }) });
    api.request('/api/posts/' + id + '/like', 'POST').catch(() => {
      this.setData({ post: previous });
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    });
  },

  inputComment(e) { this.setData({ commentText: e.detail.value }); },

  reply(e) {
    if (!getApp().globalData.token) return wx.showToast({ title: '请先登录', icon: 'none' });
    const id = e.currentTarget.dataset.id;
    const target = this.data.comments.find(item => (item.id || item._id) === id);
    if (target) this.setData({ replyTarget: target, commentText: '' });
  },

  cancelReply() { this.setData({ replyTarget: null }); },

  sendComment() {
    if (!getApp().globalData.token) return wx.showToast({ title: '请先登录', icon: 'none' });
    const content = this.data.commentText.trim();
    if (!content || this.data.submittingComment) return;
    const postId = this.data.post.id || this.data.post._id;
    const payload = { content };
    if (this.data.replyTarget) payload.parentId = this.data.replyTarget.id || this.data.replyTarget._id;
    this.submitComment(postId, payload);
  },

  submitComment(postId, payload) {
    const user = getApp().globalData.user || {};
    const target=this.data.replyTarget;
    const localId = 'local-' + Date.now();
    const optimistic = { id: localId, postId, parentId: payload.parentId || null, parentNickname: target&&target.nickname, content: payload.content, nickname: user.nickname || '匿名用户', avatarUrl: user.avatarUrl || '/assets/icons/pigeon.png', likeCount: 0, liked: false, isMine:true, createdAt:'刚刚' };
    this.setData({ submittingComment: true, comments: this.arrangeComments(this.data.comments.concat(optimistic)), post: Object.assign({}, this.data.post, {commentCount: Number(this.data.post.commentCount || 0) + 1}), commentText: '', replyTarget: null });
    api.request('/api/posts/' + postId + '/comments', 'POST', payload)
      .then(res => { const id=res.data&&res.data.id; if(id)this.setData({comments:this.data.comments.map(item=>item.id===localId?Object.assign({},item,{id}):item)}); })
      .catch(err => { this.setData({comments:this.data.comments.filter(item=>item.id!==localId),post:Object.assign({},this.data.post,{commentCount:Math.max(0,Number(this.data.post.commentCount||1)-1)})}); wx.showToast({ title: err && err.message === '所发布内容含违规信息' ? '所发布内容含违规信息' : '提交失败', icon: 'none' }); })
      .then(() => this.setData({ submittingComment: false }));
  },

  deleteComment(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({title:'删除评论',content:'确认删除这条评论？',success:res=>{if(!res.confirm)return;const old=this.data.comments;this.setData({comments:old.filter(item=>(item.id||item._id)!==id)});api.request('/api/comments/'+id,'DELETE').catch(()=>{this.setData({comments:old});wx.showToast({title:'删除失败',icon:'none'});});}});
  },

  likeComment(e) {
    if (!getApp().globalData.token) return wx.showToast({ title: '请先登录', icon: 'none' });
    const id = e.currentTarget.dataset.id;
    const previous = this.data.comments;
    const comments = previous.map(item => {
      if ((item.id || item._id) !== id) return item;
      const liked = !item.liked;
      return Object.assign({}, item, { liked, likeCount: Math.max(0, Number(item.likeCount || 0) + (liked ? 1 : -1)) });
    });
    this.setData({ comments });
    api.request('/api/comments/' + id + '/like', 'POST').catch(() => {
      this.setData({ comments: previous });
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    });
  },

  locateParent(e) {
    const id = e.currentTarget.dataset.parentId;
    if (!id) return;
    this.setData({ scrollIntoView: 'comment-' + id });
    setTimeout(() => this.setData({ scrollIntoView: '' }), 500);
  },

  copyContact() {
    const contact = this.data.post && this.data.post.contact;
    if (contact) wx.setClipboardData({ data: String(contact), success: () => wx.showToast({ title: '已复制' }) });
  },

  previewImage(e) { wx.previewImage({ current: e.currentTarget.dataset.src, urls: this.data.post.images || [] }); }
});
