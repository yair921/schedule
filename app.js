'use strict';

require('dotenv').config();
const { makeExecutableSchema } = require('graphql-tools');
const express = require('express');
const gqlMiddelware = require('express-graphql');
const { readFileSync } = require('fs');
const { join } = require('path');
const resolvers = require('./gql/resolvers');
const app = express();
//const expressFormidable = require('express-formidable');
const port = process.env.port || 3000;
//app.use(expressFormidable());

// Definiendo el esquema.
const typeDefs = readFileSync(
    join(__dirname, 'gql', 'schema.graphql'),
    'utf-8'
);

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use('/api', gqlMiddelware({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Server is running... url -> http://localhost:${port}/api`);
});