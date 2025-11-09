import Fastify from 'fastify';

class FastifySingleton {
    constructor() {
        if (!FastifySingleton.instanse) {
            this.server = Fastify({
                logger: {
                    level: 'info',
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss Z',
                            ignore: 'pid,hostname,reqId,req,res,err,responseTime'
                        }
                    }
                },
                disableRequestLogging: true
            });

            FastifySingleton.instanse = this;
        }
    }
}

const fastifyInstance = new FastifySingleton();

export default fastifyInstance;
