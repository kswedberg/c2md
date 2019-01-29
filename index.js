const {spawn} = require('child_process');

const TurndownService = require('turndown');
const turndownService = new TurndownService();

const convert = (from, to) => {
  return (str) => Buffer.from(str, from).toString(to);
};
const hexToUtf8 = convert('hex', 'utf8');

const onData = (data) => {
  const hex = `${data}`.replace(/^«data HTML/, '').replace(/»/, '');
  const txt = hexToUtf8(hex);
  const html = txt.replace(/<span> <\/span>/g, ' ');
  const markdown = turndownService.turndown(html);
  console.log(markdown);
};

const onError = (data) => {
  const err = `${data}`;

  if (/^execution error/.test(err)) {
    console.log('Sorry, but it looks like you did\'t copy *HTML* to the clipboard:');
    console.log(`  > ${data}`);
  }
};

const c2md = () => {
  const clipboard = spawn('osascript', ['-e', 'the clipboard as «class HTML»']);

  clipboard.stdout.on('data', onData);
  clipboard.stderr.on('data', onError);
  clipboard.on('close', (code) => {
    if (code < 1) {
      console.log(`\nfinished!`);
    }
  });
};

module.exports.c2md = c2md;
