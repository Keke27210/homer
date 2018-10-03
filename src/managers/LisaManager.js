const readdir = require('util').promisify(require('fs').readdir);
const Environment = require('../structures/Environment');
const Manager = require('../structures/Manager');

/** ****************************************************************
 * Lisa scripting language                                        *
 * Javascript port of jagrosh's JagTag                            *
 * 100% compatiblity with Spectra tags                            *
 * Copyright (c) 2018 - iDroid27210 & John A. Grosh (jagrosh)     *
 ***************************************************************** */

class LisaManager extends Manager {
  constructor(client) {
    super(client);

    this.maxOutput = 1900;
    this.maxIterations = 1000;
    this.methods = [];

    this.loadMethods();
  }

  async loadMethods(sandbox = false) {
    const files = await readdir('./src/lisa');
    for (const file of files) {
      const methodFile = require(`../lisa/${file}`);
      if (!sandbox) methodFile.forEach(method => this.methods.push(method));
      this.client.clearCache(`../lisa/${file}`);
    }
  }

  async reloadMethods(sandbox = false) {
    if (!sandbox) this.methods = [];
    await this.loadMethods(sandbox);
  }

  async parseString(context, string, type, tagArgs = [], children = false) {
    const env = new Environment(this.client, context, type, tagArgs, children);

    let output = this.filterEscapes(string);
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
          const method = this.methods.find(m => m.name === name);

          if (method) {
            try { result = await method.parseSimple(env); }
            catch (e) { result = `<invalid ${name} statement>`; }
          }
        } else {
          const name = content.substring(0, split).toLowerCase();
          const method = this.methods.find(m => m.name === name);
          const splitter = (method && method.split.length > 0) ?
            new RegExp(method.split.map(s => `\\${s}`).join('|')) :
            '|';

          const params = content
            .substring(split + 1)
            .split(splitter)
            .map(a => this.defilterAll(a));

          if (method) {
            try { result = await method.parseComplex(env, params); }
            catch (e) { result = `<invalid ${name} statement>`; }
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
          const value = (name === env.embedCode) ? this.defilterAll(content.substring(split + 1)) : undefined;

          try { env.embed = JSON.parse(value); }
          catch (e) {}
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

  filterEscapes(string) {
    return string
      .replaceAll('\\{', '\u0012')
      .replaceAll('\\|', '\u0013')
      .replaceAll('\\}', '\u0014');
  }

  defilterEscapes(string) {
    return string
      .replaceAll('\u0012', '{')
      .replaceAll('\u0013', '|')
      .replaceAll('\u0014', '}');
  }

  filterAll(string) {
    return this.filterEscapes(string)
      .replaceAll('{', '\u0015')
      .replaceAll('}', '\u0016');
  }

  defilterAll(string) {
    return this.defilterEscapes(string)
      .replaceAll('\u0015', '{')
      .replaceAll('\u0016', '}');
  }
}

module.exports = LisaManager;
