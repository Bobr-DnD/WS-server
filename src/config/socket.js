import { Server } from 'socket.io';
import registerRoomHandler from '../handlers/room.handler.js';
import registerSessionHandler from '../handlers/session.handler.js';
import fastifyInstance from '../core/fastify.instance.js';

const createSocketServer = () => {
    const fastify = fastifyInstance.server;
    
    const io = new Server(fastify.server, {
        cors: {
            origin: '*'
        }
    });

    io.on('connection', (socket) => {
        fastify.log.info(`User connected: ${socket.id}`);

        registerRoomHandler(io, socket);
        registerSessionHandler(io, socket);

        socket.on('disconnect', () => {
            fastify.log.info(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};



export default createSocketServer;
