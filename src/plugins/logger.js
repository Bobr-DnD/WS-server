const customLogger = async (fastify, opts) => {
    fastify.addHook('onRequest', async (request, reply) => {
        fastify.log.info(`[REQ] ${request.method} ${request.url}`);
    });

    fastify.addHook('onResponse', async (request, reply) => {
        fastify.log.info(`[RES] ${request.method} ${request.url} -> ${reply.statusCode}`);
    });

    fastify.setErrorHandler((error, request, reply) => {
        fastify.log.error(`[ERR] ${request.method} ${request.url} → ${reply.statusCode} - ${error.message}\n${error.stack}`);

        reply.code(500).send({ error: 'Internal Server Error' });
    });
};

export default customLogger;
