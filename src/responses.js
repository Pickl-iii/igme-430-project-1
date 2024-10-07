const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const rawAlphaData = JSON.parse(fs.readFileSync(`${__dirname}/data/alpha.json`));
const rawBetaData = JSON.parse(fs.readFileSync(`${__dirname}/data/beta.json`));

let data = rawAlphaData.data.cards.splice(0);
for(const element of data) { element.collected = false; }

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

const getRawData = (request, response) => {
  const status = 200;
  const responseContent = { data };

  console.log(data);

  return respondJSON(request, response, status, responseContent);
};

const getRandomCard = (request, response) => {
  const status = 200;

  const chosenCard = data[Math.floor(Math.random() * 294)];

  const responseContent = { chosenCard };

  console.log(chosenCard.name);

  return respondJSON(request, response, status, responseContent);
};

const getCardByName = (request, response) => {
  let status = 200;
  let responseContent = { };

  const chosenCard = data.find((element) => element.name === request.query.name);

  if (chosenCard != null) {
    status = 200;
    responseContent = { chosenCard };
  } else {
    status = 404;
    responseContent = { id: 'Failed to find card.' };
  }

  return respondJSON(request, response, status, responseContent);
};

/*
const addToCollection = (request, response) => {

  let status = 204;
  let responseContent = { };

  const chosenCard = data.find((element) => element.name === request.query.name);

  if (chosenCard != null) {
    status = 204;
    chosenCard.collected = !chosenCard.collected;
    responseContent = { message: "Collection updated successfully!" };
  } else {
    status = 400;
    responseContent = { id: 'Failed to find card. Please check that the name is correct.' };
  }

  return respondJSON(request, response, status, responseContent);




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
*/

const notFound = (request, response) => {
  const status = 404;
  const responseContent = { id: 'Content not found.' };

  return respondJSON(request, response, status, responseContent);
};

module.exports = {
  getIndex,
  getCSS,
  getRawData,
  getRandomCard,
  getCardByName,
  // addToCollection,
  // switchSet,
  notFound,
};
