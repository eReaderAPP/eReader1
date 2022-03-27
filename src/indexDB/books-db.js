export default{
  // 数据库名称
  databaseName: 'Books',
  // 表名称
  tableName: 'bookDetail',
  // 主键
  keyPath: 'bookName',
  // 索引
  indexList: [{
    name: 'author', // 作者
    unique: false // 不唯一
  }]
}
