"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBinCmds = exports.toTitleCase = exports.getCurrentTime = exports.colorize = exports.print = exports.resolveRelative = exports.createOnResolvePlugin = exports.createOnStartPlugin = exports.createOnEndPlugin = exports.readDirItems = exports.isProd = exports.hasDir = void 0;
const fs_1 = require("fs");
const constants_1 = require("./constants");
function hasDir(path) {
    let result = true;
    try {
        (0, fs_1.readdirSync)(path);
    }
    catch (_a) {
        result = false;
    }
    return result;
}
exports.hasDir = hasDir;
function isProd() {
    return process.env.NODE_ENV === 'production';
}
exports.isProd = isProd;
function readDirItems(path) {
    let result = undefined;
    try {
        result = (0, fs_1.readdirSync)(path);
    }
    catch (_a) {
        result = undefined;
    }
    return result;
}
exports.readDirItems = readDirItems;
function createOnEndPlugin(name, callback) {
    return { name, setup: (build) => build.onEnd(callback) };
}
exports.createOnEndPlugin = createOnEndPlugin;
function createOnStartPlugin(name, callback) {
    return { name, setup: (build) => build.onStart(callback) };
}
exports.createOnStartPlugin = createOnStartPlugin;
function createOnResolvePlugin(name, filter, callback) {
    return { name, setup: (build) => build.onResolve({ filter }, callback) };
}
exports.createOnResolvePlugin = createOnResolvePlugin;
function resolveRelative(...fragments) {
    const cleanFragments = fragments.map((value) => value.replace(/^(\/|\\)/, ''));
    return cleanFragments.join('/');
}
exports.resolveRelative = resolveRelative;
function print(...values) {
    console.log(...values);
}
exports.print = print;
function colorize(...inputs) {
    const bgColors = (0, constants_1.getBgColors)();
    const colors = (0, constants_1.getFgColors)();
    const { reset } = (0, constants_1.getUtilColors)();
    const result = inputs.map(({ bg, color, text }) => (color ? colors[color] : '') + (bg ? bgColors[bg] : '') + text + reset);
    return (inputs.length > 1 ? result : result[0]);
}
exports.colorize = colorize;
function getCurrentTime() {
    const hrTime = process.hrtime();
    return (hrTime[0] * 1000 + hrTime[1] / 1000000) / 1000;
}
exports.getCurrentTime = getCurrentTime;
function toTitleCase(value) {
    return value.slice(0, 1).toUpperCase().concat(value.slice(1).toLocaleLowerCase());
}
exports.toTitleCase = toTitleCase;
function getBinCmds(cmd) {
    const { nodeModules, types } = (0, constants_1.getDirs)();
    const files = (0, fs_1.readdirSync)(resolveRelative(nodeModules, '.bin')).filter((file) => !/\..*$/.test(file));
    (0, fs_1.writeFileSync)(resolveRelative(types, 'bin.d.ts'), `type BinCmds = { ${files.map((file) => `'${file}'`).join(', ')} }`);
    const cmds = Object.fromEntries(files.map((file) => [file, file]));
    if (cmd)
        return cmds[cmd];
    return cmds;
}
exports.getBinCmds = getBinCmds;
