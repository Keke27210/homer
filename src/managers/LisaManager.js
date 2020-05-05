const { readdirSync } = require('fs');
const { resolve } = require('path');

const Manager = require('./Manager');
const Environment = require('../structures/Environment');

/** ****************************************************************
 * Lisa scripting language                                        *
 * Javascript port of jagrosh's JagTag                            *
 * 100% compatiblity with Spectra tags                            *
 * Copyright (c) 2018 - iDroid27210 & John A. Grosh (jagrosh)     *
 ***************************************************************** */

class LisaManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Base directory for methods
     * @type {string}
     */
    this.methodDirectory = resolve(this.srcDirectory, 'lisa');

    /**
     * Maximum length of an output
     * @type {number}
     */
    this.maxOutput = 2000;

    /**
     * Maximum number of iterations
     * @type {number}
     */
    this.maxIterations = 100;

    /**
     * Registered methods
     * @type {Method[]}
     */
    this.methods = [];
  }

  /**
   * Registers all available methods into the client
   * @returns {number} Number of registered methods
   */
  registerMethods() {
    let i = 0;
    const dirContent = readdirSync(this.methodDirectory);
    for (let j = 0; j < dirContent.length; j += 1) {
      const methods = require(resolve(this.methodDirectory, dirContent[j]));
      for (let k = 0; k < methods.length; k += 1) {
        this.methods.push(methods[k]);
        i += 1;
      }
    }
    return i;
  }

  /**
   * Unregisters methods loaded in memory
   */
  unregisterMethods() {
    while (this.methods.length) this.methods.pop();
  }

  /**
   * Calls unregisterMethods() then registerMethods()
   * @returns {number} Number of registered commands
   */
  reloadMethods() {
    this.unregisterMethods();
    return this.registerMethods();
  }

  async parseString(message, string, type, tagArgs = [], children = false, embedCode) {
    const env = new Environment(this.client, message, type, tagArgs, children, embedCode);
    let repeatUsed = false;
    string = String(string);

    let output = this.constructor.filterEscapes(string);
    let lastOutput = null;

    while (output !== lastOutput) {
      const end = output.indexOf('}');
      const start = (end === -1 ? -1 : output.lastIndexOf('{', end));
      lastOutput = output;

      if ((start !== -1) && (end !== -1)) {
        const content = output.substring((start + 1), end);
        let result;

        const split = content.indexOf(':');
        if (split === -1) {
          const name = content.trim().toLowerCase();
          const method = this.methods.find((m) => m.name === name);

          if (method) {
            try {
              result = await method.parseSimple(env);
            } catch {
              result = `<invalid ${name} statement>`;
            }
          }
        } else {
          const name = content.substring(0, split).toLowerCase();
          const method = this.methods.find((m) => m.name === name);
          const splitter = (method && method.split.length > 0)
            ? new RegExp(method.split.map((s) => `\\${s}`).join('|'))
            : '|';

          const params = content
            .substring(split + 1)
            .split(splitter)
            .map((a) => this.defilterAll(a));

          if (method) {
            if (method.name === 'repeat') {
              if (repeatUsed) continue;
              repeatUsed = true;
            }

            try {
              result = await method.parseComplex(env, params);
            } catch (e) {
              result = `<invalid ${name} statement>`;
            }
          }
        }

        if (typeof result !== 'string') result = `{${content}}`;
        output = output.substring(0, start) + this.filterAll(result) + output.substring(end + 1);
      }
    }

    if (!children) {
      const embedEnd = output.indexOf('|||]|||');
      const embedStart = embedEnd === -1 ? -1 : output.lastIndexOf('|||[|||', embedEnd);

      if ((embedStart !== -1) && (embedEnd !== -1)) {
        const content = output.substring((embedStart + 7), embedEnd);
        const split = content.indexOf(':');

        if (split !== -1) {
          const name = content.substring(0, split).toLowerCase();
          const value = (name === env.embedCode)
            ? this.defilterAll(content.substring(split + 1))
            : undefined;

          try {
            env.embed = JSON.parse(value);
          } catch {
            env.embed = null;
          }
          output = output.substring(0, embedStart) + output.substring(embedEnd + 7);
        }
      }
    }

    output = this.defilterAll(output);
    if (output.length >= 2000) output = output.substring(0, 1999);

    return ({
      content: output || '​',
      embed: env.embed,
      reactions: env.reactions,
    });
  }

  static filterEscapes(string) {
    return string
      .replaceAll('\\{', '\u0012')
      .replaceAll('\\|', '\u0013')
      .replaceAll('\\}', '\u0014');
  }

  static defilterEscapes(string) {
    return string
      .replaceAll('\u0012', '{')
      .replaceAll('\u0013', '|')
      .replaceAll('\u0014', '}');
  }

  filterAll(string) {
    return this.constructor.filterEscapes(string)
      .replaceAll('{', '\u0015')
      .replaceAll('}', '\u0016');
  }

  defilterAll(string) {
    return this.constructor.defilterEscapes(string)
      .replaceAll('\u0015', '{')
      .replaceAll('\u0016', '}');
  }
}

module.exports = LisaManager;

// eslint-disable-next-line no-extend-native
String.prototype.replaceAll = function replaceAll(search, replacement) {
  return this.split(search).join(replacement);
};
