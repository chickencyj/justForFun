import mysql from 'mysql'

const defaultConfig = {
  connection: { 
    host: '127.0.0.1', 
    port: 3306, 
    user: 'root', 
    password: '', 
    database: 'test'
  }
}

class MySqlORM {
  constructor(options) {
    if (typeof options === "object" && typeof options.connection === "object") {
      // handle the params, filter others params
      const _connectConfig = Object.keys(options.connection)
      .filter(v => ['host', 'ports', 'user', 'password', 'database'].includes(v))
      .reduce((prev, cur, index) => {
        return prev[cur] = options.connection[cur]
      }, {})
      const connectConfig = Object.assign({}, defaultConfig.connection, _connectConfig)
      this.pool = mysql.createPool(connectConfig)
    } else {
      throw new Error('params error')
    }
  }

  table(tableName) {
    if (!tableName) {
      throw new Error('parameter tableName is required')
    }
    this.table = tableName
    return this
  }

  find(query) {
    /* 
    { 
      $and: [
        a: [], 
        b: []
      ],
      select: a   // default: *
    }
    */
    this.operator = 'SELECT'
    this.query = query
    return this
  }

  update(query) {
    this.operator = 'UPDATE'
    this.query = query
    return this
  }

  delete(query) {
    this.operator = 'DELETE'
    this.query = query
    return this
  }

  findOne(query) {
    this.operator = 'SELECT_ONE'
    this.query = query
    return this
  }
  
  skip(skip) {
    this.skip = skip
    return this
  }

  limit(limit) {
    this.limit = limit
    return this
  }

  then(resolve, reject) {
    return doSearch()
  }

  doSearch() {
    const parseQuery = () => {
      const selected = '*'
      const whereOp = ''
      const filters = {}
      const filterKeys = []
      const filterQuery = ''
      const limit = ''
      if (this.query.select && this.query.select.length) {
        this.query.select.forEach((v, i) => {
          i !== this.query.select.length - 1 ? select += `v, ` : select += 'v'
        })
      }
      if (this.query.$and.length) {
        whereOp = 'AND'
        filters = this.query.$and
      }
      if (this.query.$or.length) {
        whereOp = 'OR'
        filters = this.query.$or
      }
      if (this.limit) {
        limit = 'LIMIT' + this.limit
      }
      if (this.skip) {
        limit += 'OFFSET' + this.skip
      }
      filterKeys = Object.keys(filters)
      filterQuery = filterKeys.reduce((prev, cur, index) => {
          filters[cur].forEach((v, i) => {
            if (index === filterKeys.length - 1 && i === filters[cur].length - 1) {
              prev = prev + `${filterKeys[index]} = ${filters[cur][i]}`
            } else {
              prev = prev + `${filterKeys[index]} = ${filters[cur][i]} ${whereOp} `
            }
          })
      return prev
      }, 'WHERE ')
      return `${this.operator} ${selected} 
              FROM ${this.table} 
              ${filterQuery}
              ${limit}
              `
    }
    const query = parseQuery()
    const getConnection = new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          reject(err)
          return
        }
        return resolve(conn)
      })
    })
    return getConnection
    .then(coon => {
      return new Promise((resolve, reject) => {
        conn.query(query, (err, result) => {
          if (err) {
            reject(err)
            return
          }
          return resolve(result)
        })
      })
    })
    .catch(err => console.error(err))
  }
}