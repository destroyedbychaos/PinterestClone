const jsonServer = require('json-server');
const auth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('server/db.json');
const middlewares = jsonServer.defaults();

server.db = router.db;
server.use(middlewares);
server.use(auth);
server.use(router);

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});