const http = require('http');
const query = require('querystring');

const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addCardToCollection') {
    parseBody(request, response, responseHandler.addCardToCollection);
  } else if (parsedUrl.pathname === '/addTokenToCollection') {
    parseBody(request, response, responseHandler.addTokenToCollection);
  } else if (parsedUrl.pathname === '/switchSet') {
    parseBody(request, response, responseHandler.switchSet);
  }
};

const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/index' || parsedUrl.pathname === '/') {
    responseHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    responseHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getRawData') {
    responseHandler.getRawData(request, response);
  } else if (parsedUrl.pathname === '/getTokenData') {
    responseHandler.getTokenData(request, response);
  } else if (parsedUrl.pathname === '/getRandomCard') {
    responseHandler.getRandomCard(request, response);
  } else if (parsedUrl.pathname === '/getCard') {
    responseHandler.getCard(request, response);
  } else {
    responseHandler.notFound(request, response);
  }
};

const onRequest = (request, response) => {
  console.log(request.url);

  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.query = Object.fromEntries(parsedUrl.searchParams);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
