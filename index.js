'use strict';
/**
 * Nested commands helper for SockBot.
 * @module sockbot-helper-nestedcommands
 * @author Accalia
 * @license MIT
 */

/**
 * NestedCommand Helper Object
 *
 * Allows creating hirearchical commands in sockbot
 */
class NestedCommand {
    /**
     * Create a NestedCommand instance
     *
     * @public
     * @class
     */
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

    /**
     * Add a sub command to this NestedCommand instance
     *
     * @param {string} command Command name to register as a sub command
     * @param {CommandHandler} handler Standard SockBot command handler to register
     * @param {string} helpText Short help text for sub command
     */
    add(command, handler, helpText) {
        this.commands[command.toLowerCase()] = {
            handler: handler,
            helpText: helpText
        };
    }

    /**
     * CommandHandler for this NestedCommand
     *
     * @alias handler
     * @param {Command} command SockBot Command that is being executed
     * @returns {Promise} Resolves when command execution is complete
     */
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

    /**
     * Help message handler
     *
     * @alias help
     * @param {Command} command SockBot Command that is being executed
     * @returns {Promise} Resolves when command execution is complete
     */
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
