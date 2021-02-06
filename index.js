'use strict'

import LRUCache from 'lru-cache'

const ID = Symbol('id')
class LRU extends LRUCache {
  constructor(options) {
    super(options)
    this[ID] = options.id || ''
  }

  get id() {
    return this[ID]
  }
}


let debug = false

const Cache = { }

export function setDebug(mode) {
  debug = mode
}

export function clearCache(cacheName = 'default') {
  const lru = Cache[cacheName]
  if (debug) console.log('clear cache:', `${cacheName}[${lru.id}]`)
  if (lru) {
    if (debug) console.log('clearCache', lru)
    lru.reset()
  }
}

export function setCacheValue(k, v, cacheName = 'default') {
  const lru = Cache[cacheName]
  if (debug) console.log('setCacheValue:', `${cacheName}[${lru.id}]`, k, v)
  if (lru) {
    lru.set(k, v, lru.maxAge)
  }
}

export function delCacheKey(k, cacheName = 'default') {
  const lru = Cache[cacheName]
  if (debug) console.log('delCacheKey:', `${cacheName}[${lru.id}]`, k)
  if (lru) {
    if (debug) console.log('del', lru)
    lru.del(k)
  }
}

export function clearAllCache() {
  Object.keys(Cache).forEach((key) => {
    Cache[key].reset()
  })
}

const defaultParams = {
  maxAge: 300000,
  cacheName: 'default',
  addAndUpdateReturnGetRes: false,
}

export function cache(params = defaultParams) {
  const { maxAge, cacheName, addAndUpdateReturnGetRes } = { ...defaultParams, ...params }
  const listCacheName = `${cacheName}List`
  let lru = Cache[cacheName]
  const id = new Date().getTime()
  if (debug) console.log('cache...:', cacheName, lru, Cache)
  if (!lru) {
    lru = new LRU({
      maxAge,
      max: 200,
      id,
    })
    if (debug) console.log('create cache', `${cacheName}[${lru.id}]`, Cache)
    Cache[cacheName] = lru
  }
  let listLru = Cache[listCacheName]
  if (!listLru) {
    listLru = new LRU({
      maxAge,
      max: 200,
      id,
    })
    if (debug) console.log('create cache', `${listCacheName}[${lru.id}]`, Cache)
    Cache[listCacheName] = listLru
  }
  return function cacheFunction(target, name, descriptor) {
    const dValue = descriptor.value
    // eslint-disable-next-line no-param-reassign
    descriptor.value = async (...args) => {
      const k = `${name}-${args}`
      let d = null
      if (name.startsWith('get')) {
        if (debug) console.log('call', name, `${cacheName}[${lru.id}]`, k)
        d = lru.get(k)
        if (d) {
          if (debug) console.log('<=use cache:', `${cacheName}[${lru.id}]`, k, d)
          return d
        }
      } else if (name.startsWith('list')) {
        if (debug) console.log('call', name, `${listCacheName}[${lru.id}]`, k)
        d = listLru.get(k)
        if (d) {
          if (debug) console.log('<=use cache:', `${listCacheName}[${lru.id}]`, k, d)
          return d
        }
      }

      const res = await dValue.apply(target, args)
      if (name.startsWith('add')) { // C
        if (addAndUpdateReturnGetRes) {
          const getKey = `get${name.substring(3)}-${res.id}`
          lru.set(getKey, res, lru.maxAge)
          if (debug) console.log('=>set new cache:', `${cacheName}[${lru.id}]`, getKey, res)
        }
        clearCache(`${name.substring(3)}List`)
      } else if (name.startsWith('update')) { // U
        const getKey = `get${name.substring(6)}-${res.id}`
        if (addAndUpdateReturnGetRes) {
          lru.set(getKey, res, lru.maxAge)
          if (debug) console.log('=>set new cache:', `${cacheName}[${lru.id}]`, getKey, res)
        } else {
          lru.del(getKey)
          if (debug) console.log('=>delete cache:', `${cacheName}[${lru.id}]`, getKey)
        }
        clearCache(`${name.substring(6)}List`)
      } else if (name.startsWith('delete')) { // D
        const getKey = `get${name.substring(6)}-${res.id}`
        lru.del(getKey)
        clearCache(`${name.substring(6)}List`)
      } else if (name.startsWith('get')) { // get
        lru.set(k, res, maxAge)
        if (debug) console.log('=>set new cache:', `${cacheName}[${lru.id}]`, k, res)
      } else if (name.startsWith('list')) { // list
        listLru.set(k, res, maxAge)
        if (debug) console.log('=>set new cache:', `${listCacheName}[${lru.id}]`, k, res)
      }
      return res
    }

    return descriptor
  }
}

export default cache
