'use strict';

class NestedCommand {
    constructor() {
        this.handler = this._handler.bind(this);
        this.help = this._help.bind(this);
        this.commands = {
            help: {
                handler: this.help,
                helpText: 'get help listing'
            }
        };
    }
    add(command, handler, helpText) {
        this.commands[command] = {
            handler: handler,
            helpText: helpText
        };
    }
    _handler(command) {
        const cmd = command.args.shift(), // pop the nested command
            parents = `${command.parentText || command.commandText} `;
        if (!cmd) {
            const msg = `no sub command provided for '${parents.trim()}', try '${parents}help' for recognized commands`;
            command.reply(msg);
            return Promise.resolve();
        }
        const handler = this.commands[cmd.toLowerCase()];
        if (handler) {
            if (command.parentText) {
                command.parentText = parents + cmd;
            } else {
                command.parentText = parents.trim();
            }
            return handler.handler(command);
        }
        const msg = `'${parents}${cmd}' is not recognized, try '${parents}help' for recognized commands`;
        command.reply(msg);
        return Promise.resolve();
    }
    _help(command) {
        return new Promise((resolve) => {
            const keys = Object.keys(this.commands),
                result = ['Registered commands:'],
                parents = command.parentText.replace(/help$/, '');
            keys.sort();
            keys.forEach((key) => result.push(`${parents}${key}: ${this.commands[key].helpText}`));
            command.reply(result.join('\n'));
            resolve();
        });
    }
}
module.exports = NestedCommand;
