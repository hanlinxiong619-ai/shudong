// Keep campus/college choices in one place so market filters and publishing stay consistent.
const collegesByCampus = {
  花都: [
    '马克思主义学院', '历史与社会发展学院', '文学院', '外国语言文化学院', '数学学院',
    '化学与材料科学学院', '计算机学院', '音乐学院', '美术学院', '体育学院'
  ],
  海珠: ['教育学院', '教师教育学院', '管理学院', '生物与食品工程学院', '物理与信息工程学院']
};

function collegeOptions(campus) {
  return ['全部学院'].concat(collegesByCampus[campus] || []);
}

module.exports = { collegesByCampus, collegeOptions };
