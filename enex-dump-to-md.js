'use strict';
const {
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync
} = require('fs');
const { resolve, join } = require('path');
const { DateTime } = require('luxon');
const cheerio = require('cheerio');

const getFormatDate = date => {
  return DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm:ss');
};

const convertText = (data, option) => {
  const $ = cheerio.load(data, { xmlMode: true });
  const title = $('title').text();

  let optionText = null;

  if (!!Object.keys(option).length) optionText = convertNoteOptions($, option);

  try {
    const mdText = convertMd(title, optionText, $('content').text());

    const result = writeFileSync(
      resolve(process.cwd(), 'output', title + '.md'),
      mdText
    );
    return `${title}.md`;
  } catch (err) {
    throw err;
  }
};

/*
 * Convert Note options
 */
const convertNoteOptions = ($, option) => {
  let optionList = [];

  optionList.push('\n```');

  // If have a info of author
  if (option.author) optionList.push(`\nauthor: ${$('author').text()}`);

  // If have a info of created
  if (option.created)
    optionList.push(`\ncrated: ${getFormatDate($('created').text())}`);

  // If have a info of updated
  if (option.updated)
    optionList.push(`\nupdated: ${getFormatDate($('updated').text())}`);

  optionList.push('\n```');

  return optionList.join();
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

const enexDumpToMd = targetNote => {
  const outputDir = 'output';
  let outputFileName = '';

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  console.log('INPUT FILE : ', targetNote);

  try {
    statSync(targetNote);

    const data = readFileSync(targetNote, 'utf8');
    const $ = cheerio.load(data, { xmlMode: true });

    const noteList = $('note').toArray();
    for (const note of noteList) {
      outputFileName = convertText(note, {
        author: true,
        created: true,
        updated: true
      });
    }

    console.log('OUTPUT DIR : ', join(outputDir, outputFileName));
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error };
  }
};

module.exports.enexDumpToMd = enexDumpToMd;
