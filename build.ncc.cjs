const { cpSync, rmSync, writeFileSync } = require('fs');
const pac = require('./package.json');
rmSync('./build_ncc', {
  recursive: true,
  force: true
});

cpSync('./unzip.cjs', './build_ncc/unzip.cjs', { recursive: true });
cpSync('./build', './build_ncc/build', { recursive: true });
cpSync('./public', './build_ncc/public', { recursive: true });
rmSync('./build_ncc/public/data/IP2LOCATION-LITE-DB5.IPV6.BIN', {
  force: true
});
rmSync('./build_ncc/public/data/LICENSE_LITE.TXT', {
  force: true
});
rmSync('./build_ncc/public/data/README_LITE.TXT', {
  force: true
});

cpSync('./README.md', './build_ncc/README.md');

pac.scripts = {
  postinstall: 'node unzip.cjs'
};
delete pac.devDependencies;
delete pac.dependencies;
delete pac.jest;
delete pac.private
writeFileSync('./build_ncc/package.json', JSON.stringify(pac, null, 2));
