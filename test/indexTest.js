'use strict';

const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');

const NestedCommand = require('../index');

describe('sockbot-helper-nestedcommands', () => {
    describe('module', () => {

    });
    describe('NestedCommands', () => {
        it('should export function', () => {
            NestedCommand.should.be.a('function');
        });
        it('should require `new`', () => {
            const err = 'Class constructor NestedCommand cannot be invoked without \'new\'';
            chai.expect(() => NestedCommand()).to.throw(err); //eslint-disable-line new-cap
        });
        const fns = ['add', 'handler', 'help', '_handler', '_help'];
        fns.forEach((fn) => it(`should expose function ${fn}`, () => {
            const cmds = new NestedCommand();
            cmds[fn].should.be.a('function');
        }));
        it('should expose object commands', () => {
            new NestedCommand().commands.should.be.an('object');
        });
        it('should register `help` subcommand', () => {
            const cmds = new NestedCommand();
            cmds.commands.help.should.be.ok;
            cmds.commands.help.handler.should.equal(cmds.help);
            cmds.commands.help.helpText.should.equal('get help listing');
        });
    });
    describe('add()', () => {
        let cmds = null;
        beforeEach(() => {
            cmds = new NestedCommand();
        });
        it('should add command to commands list', () => {
            const command = `abc${Math.random()}def`;
            chai.expect(cmds.commands[command]).to.be.undefined;
            cmds.add(command, () => 0, 'foobar');
            cmds.commands[command].should.be.ok;
        });
        it('should store command handler', () => {
            const handler = sinon.spy();
            cmds.add('command', handler, 'foobar');
            cmds.commands.command.handler.should.equal(handler);
        });
        it('should add command to commands list', () => {
            const expected = `abc${Math.random()}def`;
            cmds.add('command', () => 0, expected);
            cmds.commands.command.helpText.should.equal(expected);
        });
    });
    describe('help()', () => {
        let cmds = null,
            command = null;
        beforeEach(() => {
            cmds = new NestedCommand();
            cmds.commands = {
                one: {
                    helpText: 'command one'
                },
                two: {
                    helpText: 'command two'
                },
                three: {
                    helpText: 'command three'
                },
                four: {
                    helpText: 'command four'
                }
            };
            command = {
                reply: sinon.stub(),
                parentText: 'nested help'
            };
        });
        it('should print help listing', () => {
            const expected = 'Registered commands:\n' +
                'nested four: command four\n' +
                'nested one: command one\n' +
                'nested three: command three\n' +
                'nested two: command two';
            return cmds.help(command).then(() => {
                const actual = command.reply.firstCall.args[0];
                actual.should.equal(expected);
            });
        });
    });
    describe('handler()', () => {
        let cmds = null,
            command = null,
            handler = null;
        beforeEach(() => {
            handler = sinon.stub().resolves();
            cmds = new NestedCommand();
            cmds.commands = {
                nested: {
                    handler: handler
                }
            };
            command = {
                reply: sinon.stub(),
                commandText: 'nested',
                args: []
            };
        });
        it('should suggest subcommand `help` with zero args', () => {
            return cmds.handler(command).then(() => {
                handler.called.should.be.false;
                command.reply.called.should.be.true;
                const msg = 'no sub command provided for \'nested\', try \'nested help\' for recognized commands',
                    arg = command.reply.firstCall.args[0];
                arg.should.equal(msg);
            });
        });
        it('should suggest subcommand `help` with unrecognized arg', () => {
            const expected = `aaa${Math.random()}bbb`;
            command.args.push(expected);
            return cmds.handler(command).then(() => {
                handler.called.should.be.false;
                command.reply.called.should.be.true;
                const msg = `'nested ${expected}' is not recognized, try \'nested help\' for recognized commands`,
                    arg = command.reply.firstCall.args[0];
                arg.should.equal(msg);
            });
        });
        it('should execute sub command when recognized', () => {
            const expected = `aaa${Math.random()}bbb`;
            command.args.push('nested');
            command.args.push(expected);
            return cmds.handler(command).then(() => {
                handler.called.should.be.true;
                handler.calledWith(command).should.be.true;
                command.reply.called.should.be.false;
                command.parentText.should.equal('nested');
                command.args.should.eql([expected]);
            });
        });
        it('should execute sub sub command when recognized', () => {
            const expected = `aaa${Math.random()}bbb`;
            command.args.push('nested');
            command.args.push(expected);
            command.parentText = 'more';
            return cmds.handler(command).then(() => {
                handler.called.should.be.true;
                handler.calledWith(command).should.be.true;
                command.reply.called.should.be.false;
                command.parentText.should.equal('more nested');
                command.args.should.eql([expected]);
            });
        });
    });
});
