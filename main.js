'use strict';
const { enexDumpToMd } = require('./enex-dump-to-md');

(async () => {
  const targetNote = process.argv[2] ? process.argv[2] : 'My Notes.enex';
  const response = enexDumpToMd(targetNote);

  if (response.error) console.error(response.error);

  console.log(response.status);
})();
