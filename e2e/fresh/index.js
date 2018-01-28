const fs = require('fs');
const Promise = require('promise');
const HandlebarsGenerator = require('../../');

const SCRIPT_INITIAL = `\
module.exports = {
    title: 'fake',
};
`;
const SCRIPT_FINAL = `\
module.exports = {
    title: 'real',
};
`;

Promise.resolve({})
    .then(writeScriptInitial)
    .then(createSite)
    .then(writeScriptFinal)
    .then(createSite)
;

function writeScriptInitial() {
    return writeScript(SCRIPT_INITIAL);
}

function writeScriptFinal() {
    return writeScript(SCRIPT_FINAL);
}

function writeScript(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(__dirname + '/src/sample.js', data, 'utf8', (err) => {
            err ? reject(err) : resolve();
        });
    });
}

function createSite() {
    return HandlebarsGenerator.generateSite(__dirname + '/src', __dirname + '/dist');
}