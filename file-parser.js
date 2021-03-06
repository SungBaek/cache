const fs = require('fs')
const readline = require('readline');
const EventEmitter = require('events');

/**
 * Module that will parse the input file and return the configuration in form.
 * 
 * When file is done parsing, it will emit the event 'done' with the object
 * object: {
 *   maxSize: max size of LRU in bytes
 *   imageList: List of image urls.
 * }
 */
class FileParser extends EventEmitter {
  
  readFile(fileName) {
    const fileStream = fs.createReadStream(fileName);
    fileStream.on('error', () => {
      console.error('invalid file name');
      this.emit('error');
    });
    
    const rl = readline.createInterface({
      input: fileStream,
      clrfDelay: Infinity
    });

    let fileLineCounter = 0;

    let returnObject = {
      maxSize: 0,
      imageList: [],
    };

    rl.on('line', (input) => {
      fileLineCounter++;
      if (fileLineCounter == 1) {
        returnObject.maxSize = input;
      }
      //it seems like the second line is number of files
      //I'll just ignore it if that's the case.
      else if (fileLineCounter > 2) {
        returnObject.imageList.push(input);
      }
    })
    .on('close', () => {
      this.emit('done', returnObject);
    });
    return this;//for chaining.
  }
}

module.exports = FileParser;
