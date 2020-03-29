const LinkedList = require('linked-list');
const request = require('sync-request');

class LRU {
  constructor(maxCacheSize) {
  	this.maxCacheSize = maxCacheSize;
  	this.fileLinkedList = new LinkedList();
  	this.fileMap = new Map();
  	this.currentCacheSize = 0;
  }

  containsFile(fileUrl) {
  	return this.fileMap.has(fileUrl);
  }

  fetchFile(fileUrl) {
  	if (this.fileMap.has(fileUrl)) {
  	  const fileListItem = this.fileMap.get(fileUrl);
  	  fileListItem.detach();
  	  this.fileLinkedList.append(fileListItem);
  	  console.log(`${fileUrl} CACHE ${fileListItem.value}`);
  	}
  	//add to the map
  	else {
  	  const fileResponse = request('GET', encodeURI(fileUrl));
  	  const fileSize = fileResponse.headers['content-length'];
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

module.exports = LRU;