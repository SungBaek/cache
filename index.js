'user strict';
const FileParser = require('./file-parser');
const LRU = require('./lru');

if (process.argv.length != 3) {
  console.error("Please pass in the input file path");
  return;
}

const fileParser = new FileParser();

fileParser.readFile(process.argv[2])
  .on('done', (parsedFile) => {
  	const lru = new LRU(parsedFile.maxSize);
  	for (let i = 0; i < parsedFile.imageList.length; i++) {
  	  lru.fetchFile(parsedFile.imageList[i]);
  	}
  })
  .on('error', () => {
  	console.log("ran into an error");
  });

