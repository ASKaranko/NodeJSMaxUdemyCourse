const { URL: urlObject } = require('url');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>List Of Users</title></head>');
        res.write('<body><div>Hello. Please use /users to see users.</div>');
        res.write('<div>Enter User Name below to create a user</div>');
        res.write('<div style="margin-top:30px;"></div>');
        res.write('<form action="/create-user" method="POST"><input type="text" name="username">');
        res.write('<button type="submit">Send</button></form></body>');
        res.write('</form></body>');
        res.write('</html>');
        return res.end();
    }
    if (url === '/create-user' && method === 'POST') {
        const body = [];
        req.on('data', chunk => {
            body.push(chunk);
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            console.log('User Name: ', parsedBody.split('=')[1]);
            res.statusCode = 302;
            res.setHeader('Location', '/users?username=' + parsedBody.split('=')[1]);
            return res.end();
        });
    }
    if (url.includes('/users') && method === 'GET') {
        const targetUrl = new urlObject('http://localhost:3000' + url);
        const urlParams = targetUrl.searchParams;
        const username = urlParams.get('username');
        res.write('<html>');
        res.write('<head><title>List Of Users</title></head>');
        res.write('<body>');
        res.write('<div><ul>');
        res.write('<li>Test User 1</li>');
        res.write('<li>Test User 2</li>');
        res.write('<li>Test User 3</li>');
        res.write(`<li>${username}</li>`);
        res.write('</ul></div>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }
};

module.exports = {
    handler: requestHandler,
};