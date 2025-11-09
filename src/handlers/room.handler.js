import { roomManager } from '../core/rooms/room.manager.js';
import fastifyInstance from '../core/fastify.instance.js';

const registerRoomHandler = (io, socket) => {
    const fastify = fastifyInstance.server;

    socket.on('session:join', (sessionId) => {
        const room = roomManager.join(socket.id, sessionId);
        socket.join(sessionId);
        fastify.log.info(`User ${socket.id} joined session ${sessionId}`);
        io.to(sessionId).emit('session:update', room.toJSON());
    });

    socket.on('session:leave', (sessionId) => {
        roomManager.leave(socket.id, sessionId);
        socket.join(sessionId);
        fastify.log.info(`User ${socket.id} left session ${sessionId}`);
    });

    socket.on('disconnect', () => {
        roomManager.leaveAll(socket.id);
        fastify.log.info(`User ${socket.id} disconnected`);
    });
};

export default registerRoomHandler;
