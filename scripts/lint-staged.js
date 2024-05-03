"use strict";
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const micromatch_1 = __importDefault(require("micromatch"));
const path_1 = require("path");
const tsconfig_json_1 = require("../tsconfig.json");
const constants_1 = require("./libs/constants");
const config = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const { nodeModules } = (0, constants_1.getDirs)();
    const tsFiles = match(files, 'ts', 'tsx');
    const assortedFiles = match(files, 'html', 'css', 'json');
    generateTsconfig(tsFiles);
    const typecheck = createCommand('tsc', `--project ${(0, path_1.resolve)(nodeModules, 'tsconfig.json')}`);
    const eslint = createCommand('eslint', '--fix $0', tsFiles.join(' '));
    const prettier = createCommand('prettier', '--write $0', [...assortedFiles, ...tsFiles].join(' '));
    return [applyCommand(typecheck, tsFiles), applyCommand(prettier, assortedFiles), applyCommand(eslint, tsFiles)].flat();
});
function applyCommand(cmd, files) {
    return files.length ? [cmd] : [];
}
function generateTsconfig(files) {
    const { nodeModules } = (0, constants_1.getDirs)();
    const configs = JSON.stringify({
        compilerOptions: Object.assign(Object.assign({}, tsconfig_json_1.compilerOptions), { baseUrl: (0, path_1.resolve)('.') }),
        files,
    });
    (0, fs_1.writeFileSync)((0, path_1.resolve)(nodeModules, 'tsconfig.json'), configs);
}
function match(files, ...extensions) {
    return (0, micromatch_1.default)(files, extensions.map((ext) => ext.replace('.', '')).map((ext) => `**/*.${ext}`));
}
function createCommand(binCmd, args, ...interpolates) {
    const prefix = 'node_modules/.bin/';
    let command = prefix + binCmd + ' ' + args;
    for (let i = 0; i < interpolates.length; i++)
        command = command.replace(new RegExp(`\\$\{?${i}}?`), interpolates[i]);
    return command;
}
module.exports = config;
