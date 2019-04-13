'use strict';
const {
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync
} = require('fs');
const { resolve } = require('path');
const { DateTime } = require('luxon');
const cheerio = require('cheerio');

const getFormatDate = date => {
  return DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm:ss');
};

const convertText = (data, option) => {
  const $ = cheerio.load(data, { xmlMode: true });
  const title = $('title').text();

  let optionList = [];

  if (!!Object.keys(option).length) optionList.push('\n```');
  if (option.author) optionList.push(`\nauthor: ${$('author').text()}`);
  if (option.created)
    optionList.push(`\ncrated: ${getFormatDate($('created').text())}`);
  if (option.updated)
    optionList.push(`\nupdated: ${getFormatDate($('updated').text())}`);
  if (!!Object.keys(option).length) optionList.push('\n```');
  const optionText = optionList.join();

  try {
    const mdText = convertMd(title, optionText, $('content').text());

    const result = writeFileSync(
      resolve(process.cwd(), 'output', title + '.md'),
      mdText
    );
    return result;
  } catch (err) {
    throw err;
  }
};

const convertMd = (title, optionText, content) => {
  try {
    const c2 = content.replace(/<div>/g, '\n');
    const c3 = c2.replace(/<\/div>/g, '');
    const c4 = c3.replace(/<br\s\/>/g, '\n');
    const c5 = c4.replace(/<a href=\"/g, '[');
    const c6 = c5.replace(/\">/g, '](');
    const c7 = c6.replace(/<\/a>/g, ')');
    const c8 = c7.replace(
      '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd](<en-note>',
      ''
    );
    const c9 = c8.replace(/<\/en-note>/, '');
    const c10 = `# ${title} ${optionText ? optionText : null} \n${c9}`;
    return c10;
  } catch (err) {
    throw err;
  }
};

(async () => {
  let inputFile = '';
  const outputDir = 'output';

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  if (process.argv[2]) {
    inputFile = process.argv[2];
  } else {
    inputFile = 'My Notes.enex';
  }

  console.log('INPUT FILE : ', inputFile);
  console.log('OUTPUT DIR : ', outputDir);

  try {
    statSync(inputFile);

    const data = readFileSync(inputFile, 'utf8');
    const $ = cheerio.load(data, { xmlMode: true });

    const noteList = $('note').toArray();
    for (const note of noteList) {
      convertText(note, { author: true, created: true, updated: true });
    }
  } catch (err) {
    console.error(err);
  }
})();
