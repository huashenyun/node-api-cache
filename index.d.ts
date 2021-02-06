export declare function setDebug(mode: boolean) : void;
export declare function clearCache(cacheName: string): void;
export declare function setCacheValue(k: string, v:  {}, cacheName: string) : void;
export declare function delCacheKey(k: string, cacheName: string) : void;
export declare function clearAllCache() : void;
export declare function cache(params:  {}):  () => void;