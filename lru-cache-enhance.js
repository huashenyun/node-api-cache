import LRUCache from 'lru-cache'


const ID = Symbol('id')

class LRUCacheEnhance extends LRUCache {
  constructor(options) {
    super(options) // 调用父类的constructor(x, y)
    this[ID] = options.id || ''
  }

  get id() {
    return this[ID]
  }
}

module.exports = LRUCacheEnhance
