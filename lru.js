const LinkedList = require('linked-list');
const request = require('sync-request');

/**
 * File fetcher that will retrieve a file specified by the url.
 * It has an internal cache (LRU scheme) with max capacity of maxCacheSize.
 */
class FileFetcherWithCache {

  constructor(maxCacheSize) {
  	this.maxCacheSize = maxCacheSize;
  	this.fileLinkedList = new LinkedList();
  	this.fileMap = new Map();
  	this.currentCacheSize = 0;
  }

  /**
   * Fetch the file specified by fileUrl.
   * If the file is in the internal LRU cache.
   * @param fileUrl - string of the file url
   * @param ignoreCache - boolean param if set to true, will ignore the cache.
   *                      useful if data consistency is utmost importance.
   */
  fetchFile(fileUrl, ignoreCache) {
  	if (this.fileMap.has(fileUrl) && !ignoreCache) {
  	  const fileListItem = this.fileMap.get(fileUrl);
  	  fileListItem.detach();
  	  this.fileLinkedList.append(fileListItem);
  	  console.log(`${fileUrl} CACHE ${fileListItem.value}`);
  	}
  	else {
  	  let fileResponse;
	  try {
  	    fileResponse = request('GET', encodeURI(fileUrl));
  	  }
  	  catch (error) {
  	  	console.error(`Could not visit URL : "${fileUrl}"`);
  	  	return;
  	  }
  	  const fileSize = parseInt(fileResponse.headers['content-length'], 10);
  	  const cacheItem = new LRUItem(fileUrl, fileSize);
  	  this.fileMap.set(fileUrl, cacheItem);
  	  this.fileLinkedList.append(cacheItem);

  	  //check if map should be reduced
  	  this.currentCacheSize += fileSize;
  	  while (this.currentCacheSize > this.maxCacheSize) {
  	  	const itemToEvict = this.fileLinkedList.head;
  	  	this.fileMap.delete(itemToEvict.key);
  	  	itemToEvict.detach();
  	  	this.currentCacheSize -= itemToEvict.value;
  	  }
  	  console.log(`${fileUrl} DOWNLOAD ${fileSize}`);
  	}
  }
}

class LRUItem extends LinkedList.Item{
  constructor(key, value) {
  	super();
  	this.key = key;
  	this.value = value;
  	LinkedList.Item.apply(this, arguments);
  }
}

module.exports = FileFetcherWithCache;