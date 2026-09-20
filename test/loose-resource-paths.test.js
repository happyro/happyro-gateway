const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const iconv = require('iconv-lite');
const Client = require('../src/controllers/clientController');

test('serves Korean loose resources for the client CP949 byte-string paths', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'happyro-loose-icons-'));
  const previous = process.env.DATA_OVERRIDE_PATH;
  t.after(async () => {
    if (previous === undefined) delete process.env.DATA_OVERRIDE_PATH;
    else process.env.DATA_OVERRIDE_PATH = previous;
    await fs.rm(root, {recursive: true});
  });
  process.env.DATA_OVERRIDE_PATH = root;
  const relative = 'texture/유저인터페이스/item/DK_DRAGONIC_BREATH.bmp';
  const expected = Buffer.from('reviewed-icon-content');
  await fs.mkdir(path.dirname(path.join(root, relative)), {recursive: true});
  await fs.writeFile(path.join(root, relative), expected);
  const clientPath = 'data/' + iconv.encode(relative, 'cp949').toString('latin1');

  assert.deepEqual(await Client.getFile(clientPath), expected);
  assert.deepEqual(await Client.getFile('data/' + relative), expected);
  assert.deepEqual(await Client.getFile(clientPath.replaceAll('/', '\\')), expected);
  assert.equal(await Client.getFile('data/../../outside.bmp'), null);
});
