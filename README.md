# Reveal Frontend

[![Coverage Status](https://coveralls.io/repos/github/onaio/reveal-frontend/badge.svg?branch=master)](https://coveralls.io/github/onaio/reveal-frontend?branch=master)

This is the Reveal web application front end.

The structure of this repo is inherited from [create-react-app](https://github.com/facebook/create-react-app).

## Guidelines

- We try follow the [BEM](https://en.bem.info/methodology/quick-start/) or Block Element Modifier guidelines for CSS.
- We strictly follow the [three principles of redux](https://redux.js.org/introduction/three-principles).

## Getting started

First, copy the included `.env.sample` into `.env`

```sh
cp .env.sample .env
```

Next install packages using yarn and then start the app:

```sh
yarn

yarn start
```

## Configuration

The configurations are located in the `configs` directory and are split into two modules:

- **env.ts**: this module reads configurations from environemt variables
- **settings.ts**: this module holds more complicated configurations

## Testing

```sh
yarn test
```

### Run test and generate coverage report

Generating reports significantly slows down your tests. Therefore, use this option when you only need
a coverage report.

```sh
yarn test:coverage
```
