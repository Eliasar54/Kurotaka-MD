'use strict';
const fs = require('fs');
const path = require('path');
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
const config = {
  suppressModuleLogs: true,
  disallowedPaths: ['node_modules', '@whiskeysockets/baileys'],
  allowedPaths: []
};
function getCallerFile(depth = 2) {
  const origPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const stack = err.stack;
  Error.prepareStackTrace = origPrepareStackTrace;
  return stack && stack.length > depth ? stack[depth].getFileName() : null;
}
function isSuppressed(filePath) {
  if (!filePath) return false;
  for (const disallowed of config.disallowedPaths) {
    if (filePath.includes(disallowed)) {
      for (const allowed of config.allowedPaths) {
        if (filePath.includes(allowed)) return false;
      }
      return true;
    }
  }
  return false;
}
function logHandler(method, args) {
  try {
    if (config.suppressModuleLogs && isSuppressed(getCallerFile(3))) return;
  } catch (e) {}
  originalConsole[method](...args);
}
function overrideConsole() {
  console.log = (...args) => logHandler('log', args);
  console.warn = (...args) => logHandler('warn', args);
  console.error = (...args) => logHandler('error', args);
  console.info = (...args) => logHandler('info', args);
  console.debug = (...args) => logHandler('debug', args);
  console.trace = (...args) => logHandler('trace', args);
}
function restoreConsole() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  console.trace = originalConsole.trace;
}
function updateConfig(newConfig) {
  Object.assign(config, newConfig);
}
overrideConsole();
module.exports = { updateConfig, overrideConsole, restoreConsole, config };