const fs = require('fs');

// Front Facing Files
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

// Raw JSON Data
const rawAlphaData = JSON.parse(fs.readFileSync(`${__dirname}/data/alpha.json`));
const rawBetaData = JSON.parse(fs.readFileSync(`${__dirname}/data/beta.json`));

// Configure data to be easier to work with
let data = rawAlphaData.data.cards.splice(0);
for(const element of data) { element.collected = false; }

let tokenData = [];

// Basic Response Protocol
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

// Repond with JSON
const respondJSON = (request, response, status, content) => respond(request, response, status, JSON.stringify(content), 'application/json');

// Returns index.html
const getIndex = (request, response) => respond(request, response, 200, index, 'text/html');

// Returns CSS sheet
const getCSS = (request, response) => respond(request, response, 200, css, 'text/css');

// Returns the current set's raw data object as JSON
const getRawData = (request, response) => {
  const status = 200;
  const responseContent = { data };

  return respondJSON(request, response, status, responseContent);
};

// Returns the current tokens array as JSON
const getTokenData = (request, response) => {
  const status = 200;
  const responseContent = { tokenData };

  return respondJSON(request, response, status, responseContent);
};

// Returns a random card from the currently selected set
const getRandomCard = (request, response) => {
  const status = 200;

  const chosenCard = data[Math.floor(Math.random() * 294)];

  const responseContent = { chosenCard };

  return respondJSON(request, response, status, responseContent);
};

// Returns requested card given a name parameter, or fails to find. 
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

// Flips requested card's collected status, if card is found.
const addCardToCollection = (request, response) => {
  let status = 500;
  let responseContent = { };

  const chosenCard = data.find((element) => element.name === request.body.name);

  

  if (chosenCard != null) {
    status = 204;
    chosenCard.collected = !chosenCard.collected;
    responseContent = { message: "Collection updated successfully!" };
  } else {
    status = 400;
    responseContent = { id: 'Failed to find card. Please check that the name is correct.' };
  }

  return respondJSON(request, response, status, responseContent);
};

// Flips requested card's collected status, if card is found.
const addTokenToCollection = (request, response) => {
  let status = 500;
  let responseContent = { };

  const newToken = {
    name: request.body.name,
    description: request.body.description,
  };

  if (newToken.name && newToken.description) {
    status = 201;
    tokenData.push(newToken);
    responseContent = { message: "Token added successfully!" };
  } else {
    status = 400;
    responseContent = { id: 'Missing Valid Parameters.' };
  }

  return respondJSON(request, response, status, responseContent);
};

// Default response when a request cannot be found.
const notFound = (request, response) => {
  const status = 404;
  const responseContent = { id: 'Content not found.' };

  return respondJSON(request, response, status, responseContent);
};

module.exports = {
  getIndex,
  getCSS,
  getRawData,
  getTokenData,
  getRandomCard,
  getCardByName,
  addCardToCollection,
  addTokenToCollection,
  // switchSet,
  notFound,
};
