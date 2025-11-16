import { roomManager } from '../core/rooms/room.manager.js';
import fastifyInstance from '../core/fastify.instance.js';
import { getSessionMove, getSessionName } from '../service/session.service.js';
import { getCharacterName } from '../service/character.service.js';

const registerRoomHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:join', async (sessionId, { role }) => {
        const sessionName = await getSessionName(sessionId);
        if (!sessionName) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            return;
        }

        const session = roomManager.join(socket.id, sessionId, role);

        socket.join(sessionId);

        io.to(sessionId).emit('session:update', {
            session: session.toJSON(),
        });

        socket.emit('session:join', {
            session: session.toJSON(),
        });

        fastify.log.info({
            socketId: socket.id,
            role: role,
            sessionId: sessionId,
        }, `User joined session ${sessionName}`);
    });

    socket.on('session:leave', (sessionId) => {
        const session = roomManager.leave(socket.id, sessionId);

        socket.leave(sessionId);
        
        if (session && session.members.length) {
            io.to(sessionId).emit('session:update', roomManager.get(sessionId).toJSON());
        }

        fastify.log.info({
            socketId: socket.id,
            sessionId: sessionId,
        }, 'User left session');        
    });

    socket.on('session:reconnect', async (sessionId, { role, characterId }) => {
        const sessionName = await getSessionName(sessionId);
        if (!sessionName) {
            socket.emit('error', { message: `Session with id ${sessionId} not found` });
            return;
        }

        const session = roomManager.get(sessionId);

        if (session) {
            session.addMember(socket.id, role);
            if (characterId) {
                session.connectCharacterToMember(socket.id, characterId);
            }
            socket.join(sessionId);

            const move = await getSessionMove();

            io.to(sessionId).emit('session:update', {
                session: session.toJSON(),
                move: move,
            });

            const characterName = characterId
                ? await getCharacterName(characterId)
                : null;

            fastify.log.info({ 
                socketId: socket.id,
                sessionId: sessionId,
                characterId: characterId,
            }, `User ${characterName ? `(${characterName}) ` : ''}reconnected to session (${sessionName})`);
        }
    });

    socket.on('disconnect', () => {
        const sessionIds = roomManager.leaveAll(socket.id);

        sessionIds.forEach((sessionId) => {
            const session = roomManager.get(sessionId);
            if (session && session.members.length) {
                io.to(sessionId).emit('session:update', session.toJSON());
            }
        });

        fastify.log.info({
            socketId: socket.id,
        }, 'User disconnected');
    });
};

export default registerRoomHandler;
