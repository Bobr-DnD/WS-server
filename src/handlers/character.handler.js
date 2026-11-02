import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getCharacter, updateCharacter } from '../service/character.service.js';
import { getSession } from '../service/session.service.js';
import fastifyInstance from '../core/fastify.instance.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { logDataChange, logAction } from '../utils/wsLogger.js';
import { applyPatchOps } from '../utils/patchHelper.js';
import { AuthError } from '../utils/errors.js';

const registerCharacterHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('character:updateData', async ({ id, ops, message }) => {
        try {
            const character_ = await getCharacter(id)
            const room = roomManager.get(character_.session.toString())
            const member = room?.members.get(socket.id)

            const isAdmin = member?.role === 'admin'
            const isOwnCharacter = member?.userId === id

            if (!member || (!isAdmin && !isOwnCharacter)) {
                throw new AuthError('Not authorized to update this character')
            }

            const patch = applyPatchOps(ops)
            const { character, diff } = await updateCharacter(id, patch)
            const session = await getSession(character.session)

            logDataChange(socket, {
                event: 'character:updateData',
                sessionId: character.session.toString(),
                characterId: character.id,
                diff,
                message: typeof message === 'string' ? message.slice(0, 500) : null
            })

            if (room) {

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:updateDataNotify', character)
                    }

                    if (value.role === 'admin') {
                        io.to(key).emit('session:updateDataNotify', session)
                    }
                })
            }
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    // Dice rolls don't change character data - they're private to the roller
    // (per the request, not broadcast) and exist purely for the audit log, so
    // this just records the client-built message under the roller's own
    // session/character context, derived from their room membership.
    socket.on('character:rollDice', ({ message } = {}) => {
        logAction(socket, {
            event: 'character:rollDice',
            message: typeof message === 'string' ? message.slice(0, 500) : 'Персонаж кинув кубик'
        })
    })

    socket.on('character:updateDataNotify', async (characterId) => {
        try {
            const character = await getCharacter(characterId)

            const room = roomManager.get(character.session.toString())

            if (room) {

                room.members.forEach((value, key) => {
                    if (value.userId === character.id) {
                        io.to(key).emit('character:updateDataNotify', character)
                    }

                    if (value.role === 'admin') {
                        io.to(key).emit('character:updateNotify', character)
                    }
                })
            }
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    });
}

export default registerCharacterHandler;