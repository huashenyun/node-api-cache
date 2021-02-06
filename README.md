# js-api-cache 

improve experience by caching api returns


## Installation:

```javascript
npm i js-api-cache
```

## Usage:

```javascript
import { cache, clearCache, setDebug } from 'js-api-cache'

setDebug(true)

//CRUD api cache samples for Xxxx object

@cache({ maxAge: 300000, cacheName: 'Xxxx' })
async listXxxx() {
	... 	// fectch url
    return xArray
}

@cache({ maxAge: 300000, cacheName: 'Xxxx' })
async getXxxx() {
	...
    return xObject
}

@cache({ maxAge: 300000, cacheName: 'Xxxx' })
async addXxxx() {
	...
    return xObjectOrId
}  

@cache({ maxAge: 300000, cacheName: 'Xxxx' })
async updateXxxx() {
	...
    return xObjectOrId
}  
```
