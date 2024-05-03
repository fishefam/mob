"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFgColors = exports.getUtilColors = exports.getBgColors = exports.getElectronStaticFiles = exports.getDirs = exports.getOptionEntries = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function getOptionEntries(platform) {
    const flagRegex = /\.entry\./;
    const workerRegex = /workers/;
    const { electron, source } = getDirs();
    const buildFiles = (0, fs_1.readdirSync)(source, { recursive: true, withFileTypes: true }).filter(({ name, path }) => flagRegex.test(name) || workerRegex.test(path));
    const platforms = ['node', 'browser'];
    const [nodeFiles, browserFiles] = platforms.map((platform) => buildFiles.filter(({ path }) => new RegExp(platform).test(path)));
    const makeEntries = (files) => files.map(({ name, path }) => ({
        in: (0, path_1.resolve)(path, name),
        out: (0, path_1.resolve)(path, name.replace(flagRegex, '.'))
            .replace(new RegExp(source), electron)
            .replace(/(\.[\w\d]+)$/, ''),
    }));
    return makeEntries(platform === 'node' ? nodeFiles : browserFiles);
}
exports.getOptionEntries = getOptionEntries;
function getDirs() {
    return {
        assets: 'public',
        electron: '.electron',
        nodeModules: 'node_modules',
        out: 'dist',
        source: 'src',
        types: 'types',
    };
}
exports.getDirs = getDirs;
function getElectronStaticFiles() {
    const extensions = ['js', 'cjs', 'mjs'];
    const forgeConfigFiles = extensions.map((ext) => 'forge.config.' + ext);
    return [...forgeConfigFiles, 'package-lock.json', 'package.json'];
}
exports.getElectronStaticFiles = getElectronStaticFiles;
function getBgColors() {
    return {
        black: '\x1b[40m',
        blue: '\x1b[44m',
        cyan: '\x1b[46m',
        gray: '\x1b[100m',
        green: '\x1b[42m',
        magenta: '\x1b[45m',
        red: '\x1b[41m',
        white: '\x1b[47m',
        yellow: '\x1b[43m',
    };
}
exports.getBgColors = getBgColors;
function getUtilColors() {
    return {
        hidden: '\x1b[8m',
        reset: '\x1b[0m',
        reverse: '\x1b[7m',
        underscore: '\x1b[4m',
    };
}
exports.getUtilColors = getUtilColors;
function getFgColors() {
    return {
        black: '\x1b[30m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m',
        green: '\x1b[32m',
        magenta: '\x1b[35m',
        red: '\x1b[31m',
        white: '\x1b[37m',
        yellow: '\x1b[33m',
    };
}
exports.getFgColors = getFgColors;
