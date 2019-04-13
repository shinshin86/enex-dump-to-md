'use strict';
const { enexDumpToMd } = require('./enex-dump-to-md');

(async () => {
  const targetNote = process.argv[2] ? process.argv[2] : 'My Notes.enex';
  enexDumpToMd(targetNote);
})();
