import { roomManager } from '../core/rooms/room.manager.js';
import fastifyInstance from '../core/fastify.instance.js';
import { getSessionMove } from '../service/session.service.js';

const registerRoomHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:join', (sessionId, { role }) => {
        const session = roomManager.join(socket.id, sessionId, role);

        socket.join(sessionId);

        io.to(sessionId).emit('session:update', {
            session: session.toJSON(),
        });

        fastify.log.info(`User ${socket.id} joined session ${sessionId}`);
    });

    socket.on('session:leave', (sessionId) => {
        const session = roomManager.leave(socket.id, sessionId);

        socket.leave(sessionId);

        if (session) {
            io.to(sessionId).emit('session:update', roomManager.get(sessionId).toJSON());
        }

        fastify.log.info(`User ${socket.id} left session ${sessionId}`);
    });

    socket.on('session:reconnect', async (sessionId, { role, characterId }) => {
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

            fastify.log.info(`User ${socket.id} reconnected to session ${sessionId}`);
        }
    });

    socket.on('disconnect', () => {
        const sessionIds = roomManager.leaveAll(socket.id);

        sessionIds.forEach((sessionId) => {
            const session = roomManager.get(sessionId);
            if (session) {
                io.to(sessionId).emit('session:update', session.toJSON());
            }
        });

        fastify.log.info(`User ${socket.id} disconnected`);
    });
};

export default registerRoomHandler;
