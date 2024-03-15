const { existsSync } = require('fs');
const { execSync } = require('child_process');
const { join } = require('path');
const zip = join(__dirname, 'public/data/IP2LOCATION-LITE-DB5.IPV6.BIN.zip');
const zip_path = join(__dirname, 'public/data/');
const zip_file = join(__dirname, 'public/data/IP2LOCATION-LITE-DB5.IPV6.BIN');
if (!existsSync(zip_file)) {
  process.platform === 'win32'
    ? execSync(
        `powershell -Command "Expand-Archive -Path ${zip} -DestinationPath ${zip_path} -Force"`
      )
    : execSync(`unzip -o ${zip} -d ${zip_path}`);
}
