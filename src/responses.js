const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const users = {};

const respond = (request, response, status, content, type) => {
  response.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD') {
    response.write(content);
  }

  response.end();
};

const respondJSON = (request, response, status, content) => respond(request, response, status, JSON.stringify(content), 'application/json');

const getIndex = (request, response) => respond(request, response, 200, index, 'text/html');

const getCSS = (request, response) => respond(request, response, 200, css, 'text/css');

const getUsers = (request, response) => {
  const status = 200;
  const responseContent = { users };

  return respondJSON(request, response, status, responseContent);
};

const notReal = (request, response) => {
  const status = 404;
  const responseContent = { message: 'ERROR: NOT FOUND' };

  return respondJSON(request, response, status, responseContent);
};

const addUser = (request, response) => {
  let status = 400;
  const responseContent = {
    message: 'Name and age are both required.',
  };

  const { name, age } = request.body;

  if (!name || !age) {
    responseContent.id = 'missingParams';
    return respondJSON(request, response, status, responseContent);
  }

  status = 204;

  if (!users[name]) {
    status = 201;
    users[name] = {
      name,
    };
  }

  users[name].age = age;

  if (status === 201) {
    responseContent.message = 'Created Successfully';
    return respondJSON(request, response, status, responseContent);
  }

  return respondJSON(request, response, status, {});
};

const notFound = (request, response) => {
  const status = 404;
  const responseContent = { };

  return respondJSON(request, response, status, responseContent);
};

module.exports = {
  getIndex,
  getCSS,
  getUsers,
  notReal,
  addUser,
  notFound,
};
