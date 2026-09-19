import { Server } from 'socket.io';
import registerRoomHandler from '../handlers/room.handler.js';
import registerSessionHandler from '../handlers/session.handler.js';
import registerCharacterHandler from '../handlers/character.handler.js';
import fastifyInstance from '../core/fastify.instance.js';
import { roomManager } from '../core/rooms/room.manager.js';
import { RECONNECTION_GRACE_MS } from './socket.constants.js';

const createSocketServer = () => {
    const fastify = fastifyInstance.server;

    const io = new Server(fastify.server, {
        cors: {
            origin: '*'
        },
        pingInterval: 25_000,
        pingTimeout: 20_000,
        connectionStateRecovery: {
            maxDisconnectionDuration: RECONNECTION_GRACE_MS,
            skipMiddlewares: true,
        },
    });

    io.on('connection', (socket) => {
        if (socket.recovered) {
            roomManager.cancelScheduledLeave(socket.id);
            fastify.log.info(`Connection recovered: ${socket.id}`);
        } else {
            fastify.log.info(`User connected: ${socket.id}`);
        }

        registerRoomHandler(io, socket);
        registerSessionHandler(io, socket);
        registerCharacterHandler(io, socket);
    });

    return io;
};



export default createSocketServer;
