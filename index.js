'user strict';
const FileParser = require('./file-parser');
const LRU = require('./lru');

/**
 * Entry point for the module.
 * Usage: node index.js <filePath>
 *
 * The file pointed by filePath should have the first line be the
 * max lru cache size in bytes, 2nd line be number of urls in the file, and
 * 3+ lines be list of urls delimited by new line chars.
 *
 * @author joon812@gmail.com
 */
if (process.argv.length != 3) {
  console.error("Usage: npm start <filePath>");
  return;
}

const fileParser = new FileParser();

fileParser.readFile(process.argv[2])
  .on('done', (parsedFile) => {
  	console.log("lru cache size" + parsedFile.maxSize);
  	const lru = new LRU(parsedFile.maxSize);
  	for (let i = 0; i < parsedFile.imageList.length; i++) {
  	  lru.fetchFile(parsedFile.imageList[i]);
  	}
  })
  .on('error', () => {
  	console.log("ran into an error");
  });

