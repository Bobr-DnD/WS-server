import { Server } from 'socket.io';

export const createSocketServer = (fastify) => {
    const io = new Server(fastify.server);

    io.on('connection', (socket) => {
        fastify.log.info(`User connected: ${socket.id}`);
    });

    io.on('disconnect', (socket) => {
        fastify.log.info(`User disconnected: ${socket.id}`);
    });

    return io;
};
