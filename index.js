const {spawn} = require('child_process');
const TurndownService = require('turndown');
const {gfm} = require('turndown-plugin-gfm');

// https://stackoverflow.com/questions/52261494/hex-to-string-string-to-hex-conversion-in-nodejs
const convert = (from, to) => {
  return (str) => Buffer.from(str, from).toString(to);
};
const hexToUtf8 = convert('hex', 'utf8');

const dataHandler = (tdService) => {
  return (data) => {
    const hex = `${data}`.replace(/^«data HTML/, '').replace(/»/, '');
    const txt = hexToUtf8(hex);
    const html = txt.replace(/<span> <\/span>/g, ' ');
    const markdown = tdService.turndown(html);

    console.log(markdown);
  };
};

const onError = (data) => {
  const err = `${data}`;

  if (/^execution error/.test(err)) {
    console.log('Sorry, but it looks like you did\'t copy *HTML* to the clipboard:');
    console.log(`  > ${data}`);
  }
};

const settings = {
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
};

const c2md = (options = {}) => {
  Object.assign(settings, options);

  const turndownService = new TurndownService(settings);

  turndownService.use(gfm);
  const clipboard = spawn('osascript', ['-e', 'the clipboard as «class HTML»']);
  const onData = dataHandler(turndownService);

  clipboard.stdout.on('data', onData);
  clipboard.stderr.on('data', onError);
  clipboard.on('close', (code) => {
    if (code >= 1) {
      console.log(`\nError code ${code}`);
    }
  });
};

module.exports.c2md = c2md;
