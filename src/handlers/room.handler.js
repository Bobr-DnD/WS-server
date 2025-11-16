import { roomManager } from '../core/rooms/room.manager.js';
import fastifyInstance from '../core/fastify.instance.js';

const registerRoomHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:join', (sessionId, role) => {
        const session = roomManager.join(socket.id, sessionId, role);

        socket.join(sessionId);

        io.to(sessionId).emit('session:update', session.toJSON());

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
