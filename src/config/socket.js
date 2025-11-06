const createSocketServer = (fastify) => {
    fastify.server.on('connection', (socket) => {
        fastify.log.info(`User connected: ${socket.id}`);

        socket.on('disconnect', (socket) => {
            fastify.log.info(`User disconnected: ${socket.id}`);
        });
    });

    return fastify;
};

export default createSocketServer;
