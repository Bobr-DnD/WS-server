import { Server } from 'socket.io';

const createSocketServer = (fastify) => {
    const io = new Server(fastify.server, {
        cors: {
            origin: '*'
        }
    });
    
    io.on('connection', (socket) => {
        fastify.log.info(`User connected: ${socket.id}`);

        socket.on('message', (message) => {
            fastify.log.info(`Message: ${message}`);
        });

        socket.on('disconnect', (socket) => {
            fastify.log.info(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default createSocketServer;
