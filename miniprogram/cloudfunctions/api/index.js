const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const CONTENT_REJECTED = '所发布内容含违规信息'

// All user supplied text must pass WeChat security review before persistence.
// Using the cloud SDK keeps the access token on the server and applies to every
// publish entry point (posts, comments and profile edits).
async function checkContent(content, openid, scene, title) {
  const text = String(content || '').trim()
  if (!text) return true
  if (Array.from(text).length > 2500 || (title && Array.from(String(title)).length > 2500)) {
    const tooLong = new Error('内容过长，请缩短后重试')
    tooLong.code = 400
    throw tooLong
  }
  try {
    console.info('[content-security] msgSecCheck start', { scene, length: Array.from(text).length, hasTitle: !!title })
    const result = await cloud.openapi.security.msgSecCheck({
      content: text, version: 2, scene, openid,
      ...(title ? { title: String(title) } : {})
    })
    // Cloud SDK responses have used both errCode and errcode across versions.
    const errCode = result && (result.errCode !== undefined ? result.errCode : result.errcode)
    if (Number(errCode || 0) !== 0 && Number(errCode) !== 87014) throw new Error('Security API error: ' + errCode)
    const passed = Number(errCode || 0) === 0 && !!result.result && result.result.suggest === 'pass'
    console.info('[content-security] msgSecCheck result', { errCode: errCode || 0, passed })
    return passed
  } catch (error) {
    // Do not allow content through when the security service is unavailable.
    console.error('[content-security] msgSecCheck failed', { errCode: error && error.errCode, message: error && error.message })
    const unavailable = new Error('内容检测暂不可用，请稍后重试')
    unavailable.code = 503
    throw unavailable
  }
}
const BOARD_NAMES = {
  vent: '吐槽', confide: '倾诉', wish: '心愿', second_hand: '二手市场',
  part_time: '兼职发布', lost_found: '失物寻物', help: '打听求助',
  rental: '生活指南', carpool: '校内拼车', notice: '公示栏'
}

// Images live in Cloud Storage; the database stores durable file IDs.
// Convert them to temporary HTTPS URLs so every authorized viewer can render them.
async function resolveImageUrls(rows) {
  const list = Array.isArray(rows) ? rows : [rows]
  const fileIds = [...new Set(list.flatMap(row => (row.images || []).concat(row.avatarUrl || [])).filter(id => String(id).startsWith('cloud://')))]
  if (!fileIds.length) return rows
  const urls = {}
  for (let index = 0; index < fileIds.length; index += 50) {
    const result = await cloud.getTempFileURL({ fileList: fileIds.slice(index, index + 50) })
    result.fileList.forEach(file => { if (file.tempFileURL) urls[file.fileID] = file.tempFileURL })
  }
  const mapped = list.map(row => Object.assign({}, row, {
    boardName: row.boardName || BOARD_NAMES[row.boardCode] || row.boardCode,
    avatarUrl: urls[row.avatarUrl] || row.avatarUrl,
    images: (row.images || []).map(id => urls[id] || id)
  }))
  return Array.isArray(rows) ? mapped : mapped[0]
}
exports.main = async (event) => {
  const { method = 'GET', data = {} } = event
  const [path, queryString = ''] = (event.path || '').split('?')
  console.info('[api-route]', { method, path })
  const query = {}
  queryString.split('&').filter(Boolean).forEach(item => {
    const [key, value = ''] = item.split('=')
    query[decodeURIComponent(key)] = decodeURIComponent(value)
  })
  const params = Object.assign({}, query, data)
  try {
    if (path === '/api/auth/wx-login' && method === 'POST') {
      const openid = cloud.getWXContext().OPENID
      const users = await db.collection('users').where({ openid }).limit(1).get()
      let user = users.data[0]
      if (!user) { const nickname='同学'+Math.floor(100000+Math.random()*900000); const add = await db.collection('users').add({ data: { openid, nickname, avatarUrl:'/assets/icons/pigeon.png', createdAt: db.serverDate() } }); user = { _id: add._id, nickname, avatarUrl:'/assets/icons/pigeon.png' } }
      if (user.nickname === '匿名用户') { const nickname='同学'+Math.floor(100000+Math.random()*900000); await db.collection('users').doc(user._id).update({data:{nickname}}); user.nickname=nickname }
      return { code: 200, data: { token: openid, user: await resolveImageUrls(user) } }
    }
    if (path === '/api/boards' && method === 'GET') return {code:200,data:[{code:'vent',name:'吐槽',groupType:'TREEHOLE'},{code:'confide',name:'倾诉',groupType:'TREEHOLE'},{code:'wish',name:'心愿',groupType:'TREEHOLE'},{code:'second_hand',name:'二手市场',groupType:'MARKET'},{code:'part_time',name:'兼职发布',groupType:'MARKET'},{code:'lost_found',name:'失物寻物',groupType:'MARKET'},{code:'help',name:'打听求助',groupType:'MARKET'},{code:'rental',name:'生活指南',groupType:'MARKET'},{code:'carpool',name:'校内拼车',groupType:'MARKET'},{code:'notice',name:'公示栏',groupType:'MARKET'}]}
    if (path === '/api/posts' && method === 'GET') { const r=await db.collection('posts').orderBy('createdAt','desc').limit(100).get(); let rows=r.data; if(params.group) rows=rows.filter(x=>x.groupType===params.group); if(params.board) rows=rows.filter(x=>x.boardCode===params.board); if(params.campus) rows=rows.filter(x=>x.campus===params.campus); if(params.college) rows=rows.filter(x=>x.college===params.college); if(params.board==='notice') rows.sort((a,b)=>Number(!!b.isPinned)-Number(!!a.isPinned)); rows=rows.slice(0,Number(params.pageSize||20)).map(x=>Object.assign({id:x._id},x)); return {code:200,data:await resolveImageUrls(rows)} }
    const openid = cloud.getWXContext().OPENID
    if (path === '/api/posts' && method === 'POST') {
      if (event.token !== openid) return { code: 401, message: '请先登录' }
      const postText = [data.content, data.contact].filter(Boolean).join('\n')
      console.info('[content-security] post submission received', { length: postText.length })
      if (!(await checkContent(postText, openid, 3, data.title))) return { code: 400, message: CONTENT_REJECTED }
      const users = await db.collection('users').where({ openid }).limit(1).get()
      const profile = users.data[0] || {}
      console.info('[content-security] passed; inserting post')
      const add = await db.collection('posts').add({ data: { ...data, boardName:BOARD_NAMES[data.boardCode]||data.boardCode, openid, nickname: profile.nickname || '匿名用户', avatarUrl: profile.avatarUrl || '/assets/icons/pigeon.png', likeCount: 0, viewCount: 0, commentCount: 0, createdAt: db.serverDate() } })
      return { code: 200, data: { id: add._id } }
    }
    if (/^\/api\/posts\/[^/]+$/.test(path) && method === 'GET') {
      const id = path.split('/').pop(); const res = await db.collection('posts').doc(id).get(); const viewed=await db.collection('post_views').where({postId:id,openid}).limit(1).get(); let viewCount=Number(res.data.viewCount||0); if(!viewed.data.length){await db.collection('post_views').add({data:{postId:id,openid,createdAt:db.serverDate()}});viewCount+=1;await db.collection('posts').doc(id).update({data:{viewCount}})} const liked=event.token===openid?(await db.collection('post_likes').where({postId:id,openid}).limit(1).get()).data.length>0:false; return { code: 200, data: await resolveImageUrls(Object.assign({id:res.data._id,liked,viewCount},res.data,{viewCount})) }
    }
    // Only the author can delete a post. Related comments and likes are removed together.
    if (/^\/api\/posts\/[^/]+$/.test(path) && method === 'DELETE') {
      if (event.token !== openid) return { code: 401, message: '请先登录' }
      const id = path.split('/').pop()
      const post = await db.collection('posts').doc(id).get()
      if (!post.data || post.data.openid !== openid) return { code: 403, message: '只能删除自己的帖子' }
      const cloudFiles = (post.data.images || []).filter(fileId => String(fileId).startsWith('cloud://'))
      await Promise.all([
        db.collection('posts').doc(id).remove(),
        db.collection('comments').where({ postId: id }).remove(),
        db.collection('post_likes').where({ postId: id }).remove(),
        db.collection('post_views').where({ postId: id }).remove(),
        cloudFiles.length ? cloud.deleteFile({ fileList: cloudFiles }) : Promise.resolve()
      ])
      return { code: 200, data: {} }
    }
    if (/^\/api\/posts\/[^/]+\/comments$/.test(path) && method === 'GET') {
      const id = path.split('/')[3]; const res = await db.collection('comments').where({ postId: id }).orderBy('createdAt','asc').get(); const likes=event.token===openid?await db.collection('comment_likes').where({openid}).limit(100).get():{data:[]}; const likedIds=new Set(likes.data.map(x=>x.commentId)); const byId={};res.data.forEach(x=>byId[x._id]=x);const rows=res.data.map(x=>{const parent=byId[x.parentId];return Object.assign({id:x._id,liked:likedIds.has(x._id),isMine:event.token===openid&&x.openid===openid,parentNickname:parent&&parent.nickname,parentExcerpt:parent&&String(parent.content||'').slice(0,60)},x)}); return { code: 200, data: await resolveImageUrls(rows) }
    }
    if (/^\/api\/posts\/[^/]+\/comments$/.test(path) && method === 'POST') {
      const id = path.split('/')[3]; if(!id || id==='undefined') return {code:400,message:'帖子ID无效'}; if(event.token!==openid)return {code:401,message:'请先登录'}; if (!(await checkContent(data.content, openid, 2))) return {code:400,message:CONTENT_REJECTED}; const users=await db.collection('users').where({openid}).limit(1).get(); const profile=users.data[0]||{}; const added=await db.collection('comments').add({ data: { postId: id, parentId:data.parentId||null, openid, content: data.content, nickname:profile.nickname||'匿名用户', avatarUrl:profile.avatarUrl||'/assets/icons/pigeon.png', likeCount:0, createdAt: db.serverDate() } }); await db.collection('posts').doc(id).update({data:{commentCount:db.command.inc(1)}}); return { code: 200, data: {id:added._id} }
    }
    if (/^\/api\/comments\/[^/]+$/.test(path) && method === 'DELETE') { if(event.token!==openid)return {code:401,message:'请先登录'}; const id=path.split('/').pop(); const found=await db.collection('comments').doc(id).get(); if(!found.data||found.data.openid!==openid)return {code:403,message:'只能删除自己的评论'}; await db.collection('comments').doc(id).remove(); await db.collection('posts').doc(found.data.postId).update({data:{commentCount:db.command.inc(-1)}}); return {code:200,data:{}} }
    if (path === '/api/me/comments' && method === 'GET') { const r=await db.collection('comments').where({openid}).orderBy('createdAt','desc').get(); return {code:200,data:r.data.map(x=>Object.assign({id:x._id},x))} }
    if (path === '/api/me/replies' && method === 'GET') { const [pr,cr]=await Promise.all([db.collection('posts').where({openid}).limit(100).get(),db.collection('comments').limit(100).get()]); const postIds=new Set(pr.data.map(p=>p._id)); const myCommentIds=new Set(cr.data.filter(c=>c.openid===openid).map(c=>c._id)); const rows=cr.data.filter(c=>c.openid!==openid&&(postIds.has(c.postId)||myCommentIds.has(c.parentId))); return {code:200,data:rows.map(x=>Object.assign({id:x._id},x)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))} }
    if (/^\/api\/posts\/[^/]+\/like$/.test(path) && method === 'POST') {
      const id = path.split('/')[3]; if(event.token!==openid) return {code:401,message:'请先登录'}; const liked=await db.collection('post_likes').where({postId:id,openid}).limit(1).get(); if(liked.data.length){await db.collection('post_likes').doc(liked.data[0]._id).remove();await db.collection('posts').doc(id).update({data:{likeCount:db.command.inc(-1)}});return {code:200,data:{liked:false}}} await db.collection('post_likes').add({data:{postId:id,openid,createdAt:db.serverDate()}}); await db.collection('posts').doc(id).update({ data: { likeCount: db.command.inc(1) } }); return { code: 200, data: {liked:true} }
    }
    if (/^\/api\/comments\/[^/]+\/like$/.test(path) && method === 'POST') {
      const id=path.split('/')[3]; if(event.token!==openid)return {code:401,message:'请先登录'}; const liked=await db.collection('comment_likes').where({commentId:id,openid}).limit(1).get(); if(liked.data.length){await db.collection('comment_likes').doc(liked.data[0]._id).remove();await db.collection('comments').doc(id).update({data:{likeCount:db.command.inc(-1)}});return {code:200,data:{liked:false}}} await db.collection('comment_likes').add({data:{commentId:id,openid,createdAt:db.serverDate()}});await db.collection('comments').doc(id).update({data:{likeCount:db.command.inc(1)}});return {code:200,data:{liked:true}}
    }
    if (path === '/api/hot' && method === 'GET') {
      const res = await db.collection('posts').orderBy('likeCount','desc').limit(10).get(); return { code: 200, data: await resolveImageUrls(res.data.map(x=>Object.assign({id:x._id},x))) }
    }    if (path === '/api/search' && method === 'GET') {
      const keyword=(params.q||'').trim(); if(!keyword)return {code:200,data:[]}; const [pr,cr,ur]=await Promise.all([db.collection('posts').orderBy('createdAt','desc').limit(100).get(),db.collection('comments').limit(100).get(),db.collection('users').limit(100).get()]); const matchedPostIds=new Set(cr.data.filter(c=>(c.content||'').includes(keyword)).map(c=>c.postId)); const users={}; ur.data.forEach(u=>users[u.openid]=u); const rows=pr.data.filter(p=>(p.title||'').includes(keyword)||(p.content||'').includes(keyword)||matchedPostIds.has(p._id)); const exact=rows.filter(p=>(p.title||'')===keyword||(p.content||'')===keyword); const fuzzy=rows.filter(p=>!exact.includes(p)); const result=exact.concat(fuzzy).map(x=>Object.assign({id:x._id,nickname:(users[x.openid]||{}).nickname||'匿名用户',avatarUrl:(users[x.openid]||{}).avatarUrl||'/assets/icons/pigeon.png'},x)); return {code:200,data:await resolveImageUrls(result)}
    }
    if (path === '/api/me/profile' && method === 'GET') { if(event.token!==openid)return {code:401,message:'请先登录'}; const users=await db.collection('users').where({openid}).limit(1).get(); return {code:200,data:users.data.length?await resolveImageUrls(users.data[0]):null} }
    if (path === '/api/me/profile' && method === 'POST') { if(event.token!==openid)return {code:401,message:'请先登录'}; if(params.nickname && !(await checkContent(params.nickname, openid, 1)))return {code:400,message:CONTENT_REJECTED}; const users=await db.collection('users').where({openid}).limit(1).get(); if(!users.data.length)return {code:404,message:'用户不存在'}; const update={}; if(params.nickname)update.nickname=params.nickname; if(params.avatarUrl)update.avatarUrl=params.avatarUrl; await db.collection('users').doc(users.data[0]._id).update({data:update}); return {code:200,data:await resolveImageUrls(Object.assign({},users.data[0],update))} }
    // Avoid a composite-index dependency: fetch recent posts, then filter and sort in memory.
    if (path === '/api/me/posts' && method === 'GET') { const r=await db.collection('posts').limit(100).get(); const rows=r.data.filter(x=>x.openid===openid).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(x=>Object.assign({id:x._id},x)); return {code:200,data:await resolveImageUrls(rows)} }
    return { code: 200, data: [] }
  } catch (e) { return { code: e.code === 503 || e.code === 400 ? e.code : 500, message: e.code === 503 || e.code === 400 ? e.message : '操作失败，请稍后重试' } }
}
