import { socketErrorHandler } from '../config/socketErrorHandler.js';
import { getSessionCharacters, getSessionName, updateSessionMove } from '../service/session.service.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { getCharacterName } from '../service/character.service.js';
import fastifyInstance from '../core/fastify.instance.js';

const registerSessionHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:connectCharacter', async (sessionId, { characterId }) => {
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
            const characters = await getSessionCharacters(sessionId);
            const sessionCharacterIds = characters.map(String);
            if (sessionCharacterIds.includes(characterId)) {
                const session = roomManager.connectCharacterToMember(socket.id, sessionId, characterId);
                if (session) {
                    io.to(sessionId).emit('session:update', session.toJSON());

                    const characterName = characterId
                        ? await getCharacterName(characterId)
                        : null;

                    const sessionName = await getSessionName(sessionId);
                    fastify.log.info(`${socket.id}: User pick character ${characterName ? `(${characterName})` : 'unknown character'} in session ${sessionId} (${sessionName})`);
                }
            }
        } catch (error) {
            socketErrorHandler(socket, error);
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
            const characterId = roomManager.getCharacterBySocketId(socket.id);
            const session = roomManager.disconnectCharacterFromMember(socket.id, sessionId);
            if (session) {
                io.to(sessionId).emit('session:update', session.toJSON());
            }

            const characterName = characterId
                ? await getCharacterName(characterId)
                : null;

            const sessionName = await getSessionName(sessionId);
            fastify.log.info(`${socket.id}: User unpick character ${characterName ? `(${characterName})` : 'unknown character'} in session ${sessionId} (${sessionName})`);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });

    socket.on('session:changeMove', async (sessionId, { moveValue }) => {
        const session = roomManager.get(sessionId);
        if (!session) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            return;
        }

        if (!session.hasMember(socket.id)) {
            socket.emit('error', { message: `User with id ${socket.id} is not in session ${sessionId}` });
            return;
        }

        let sessionName = null;

        try {
            sessionName = await getSessionName(sessionId);
        } catch (error) {
            socketErrorHandler(socket, error);
            return;
        }

        if (session.get(socket.id).role !== 'admin') {
            socket.emit('error', { message: `User with id ${socket.id} is not admin in session ${sessionId} (${sessionName})` });
            return;
        }
        
        try {
            const newMove = await updateSessionMove(sessionId, moveValue);
            io.to(sessionId).emit('session:update', { move: newMove });

            fastify.log.info(`Admin change move to ${newMove} in session ${sessionId} (${sessionName})`);
        } catch (error) {
            socketErrorHandler(socket, error);
        }
    });
};

export default registerSessionHandler;
