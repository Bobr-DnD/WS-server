import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getSession, getSessionCharactersIds, getSessionName, updateSession } from '../service/session.service.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { getCharacterName } from '../service/character.service.js';
import fastifyInstance from '../core/fastify.instance.js';
import { logAction } from '../utils/wsLogger.js';

const registerSessionHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    // `callback` is an optional socket.io ack - the connect involves an await
    // (getSessionCharactersIds) before the member's userId is actually set,
    // so a caller that immediately depends on that userId being set (e.g.
    // the fight page joining right after connecting the character) needs a
    // way to know the connect has actually landed, not just been sent.
    socket.on('session:connectCharacter', async (sessionId, characterId, callback) => {
        const session = roomManager.get(sessionId);
        if (!session) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            if (typeof callback === 'function') callback({ ok: false });
            return;
        }

        if (!session.hasMember(socket.id)) {
            socket.emit('error', { message: `User with id ${socket.id} is not in session ${sessionId}` });
            if (typeof callback === 'function') callback({ ok: false });
            return;
        }

        try {
            const characters = await getSessionCharactersIds(sessionId);
            const sessionCharacterIds = characters.map(String);
            let connected = false;

            if (sessionCharacterIds.includes(characterId)) {
                const session = roomManager.connectCharacterToMember(socket.id, sessionId, characterId);
                if (session) {
                    connected = true;
                    io.to(sessionId).emit('session:update', {
                        room: session.toJSON()
                    });

                    const characterName = characterId
                        ? await getCharacterName(characterId)
                        : null;

                    const sessionName = await getSessionName(sessionId);
                    fastify.log.info(`User pick character ${characterName ? `(${characterName})` : 'unknown character'} in session (${sessionName}) (socketId: ${socket.id}, sessionId: ${sessionId}, characterId: ${characterId})`);
                }
            }

            if (typeof callback === 'function') callback({ ok: connected });
        } catch (error) {
            socketErrorHandler(socket, error);
            if (typeof callback === 'function') callback({ ok: false });
        }
    });

    socket.on('session:disconnectCharacter', async (sessionId) => {
        const session = roomManager.get(sessionId);
        if (!session) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            return;
        }

        if (!session.hasMember(socket.id)) {
            socket.emit('error', { message: `User with id ${socket.id} is not in session ${sessionId}` });
            return;
        }

        try {
            const characterId = roomManager.getCharacterBySocketId(socket.id, sessionId);
            const session = roomManager.disconnectCharacterFromMember(socket.id, sessionId);
            if (session) {
                io.to(sessionId).emit('session:update', {
                    room: session.toJSON()
                });
            }

            const characterName = characterId
                ? await getCharacterName(characterId)
                : null;

            const sessionName = await getSessionName(sessionId);
            fastify.log.info(`User unpick character ${characterName ? `(${characterName})` : 'unknown character'} in session (${sessionName}) (socketId: ${socket.id}, sessionId: ${sessionId}, characterId: ${characterId})`);

            logAction(socket, {
                event: 'session:disconnectCharacter',
                sessionId,
                characterId,
                message: 'Персонаж вийшов'
            })
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('session:updateDataNotify', async (sessionId) => {
        try {
            const session = await getSession(sessionId)  
            io.to(sessionId).emit('session:updateDataNotify', session)
        }
        catch (error) {
            socketErrorHandler(socket, error);
        }
    })

};

export default registerSessionHandler;
