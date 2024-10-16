const fs = require('fs');

// Front Facing Files
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const prepareData = (rawData) => {
  // Remove unneeded data and clean up
  const data = rawData.data.cards.splice(0);
  data.map((element) => {
    element.collected = false;
  });
  return data;
};

// Raw JSON Data
const alphaData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/alpha.json`)));
const betaData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/beta.json`)));
const unlimitedData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/unlimited.json`)));
const arabianData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/arabian-nights.json`)));
const antiquitiesData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/antiquities.json`)));
const legendsData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/legends.json`)));
const darkData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/the-dark.json`)));
const empiresData = prepareData(JSON.parse(fs.readFileSync(`${__dirname}/data/fallen-empires.json`)));

let data = alphaData;
const tokenData = [];

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
  console.log(chosenCard);

  if (chosenCard != null) {
    status = 200;
    responseContent = { chosenCard };
  } else {
    status = 404;
    responseContent = { id: 'Failed to find card.' };
  }

  return respondJSON(request, response, status, responseContent);
};

// Returns requested card given a name parameter, or fails to find.
const getCard = (request, response) => {
  let status = 200;
  let responseContent = { };

  let results = data;

  // NOTE: SEARCHES ARE CASE SENSITIVE

  // Name
  if (request.query.name != null) {
    results = results.filter((card) => card.name.includes(request.query.name));
  }
  // CMC
  if (request.query.cmc != null) {
    results = results.filter((card) => card.convertedManaCost === (Number(request.query.cmc)));
  }
  // Color
  if (request.query.color != null) {
    // Custom 'C' case for colorless cards (find empty color arrays)
    if (request.query.color.include('C')) {
      results = results.filter((card) => card.colors.length === 0);
    } else {
      results = results.filter((card) => card.colors.includes(request.query.color));
    }
  }
  // Rarity
  if (request.query.rarity != null) {
    results = results.filter((card) => card.rarity.includes(request.query.rarity));
  }
  // Type
  if (request.query.type != null) {
    results = results.filter((card) => card.types.includes(request.query.type));
  }
  // Artist
  if (request.query.artist != null) {
    results = results.filter((card) => card.artist.includes(request.query.artist));
  }

  if (results.length > 0) {
    status = 200;
    responseContent = { results };
  } else {
    status = 404;
    responseContent = { id: 'Failed to find any cards matching the criteria.' };
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
    responseContent = { message: 'Collection updated successfully!' };
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
    responseContent = { message: 'Token added successfully!' };
  } else {
    status = 400;
    responseContent = { id: 'Missing Valid Parameters.' };
  }

  return respondJSON(request, response, status, responseContent);
};

// Switches the current data set
const switchSet = (request, response) => {
  let status = 500;
  let responseContent = { };

  switch (request.body.set) {
    case 'LEA':
      data = alphaData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case 'LEB':
      data = betaData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case '2ED':
      data = unlimitedData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case 'ARN':
      data = arabianData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case 'ATQ':
      data = antiquitiesData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case 'LEG':
      data = legendsData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case 'DRK':
      data = darkData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    case 'FEM':
      data = empiresData;
      status = 204;
      responseContent = { message: 'Set selected successfully!' };
      break;
    default:
      status = 400;
      responseContent = { id: 'Failed to find set. Please check that the 3 character set code is correct.' };
      break;
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
  getCard,
  addCardToCollection,
  addTokenToCollection,
  switchSet,
  notFound,
};
