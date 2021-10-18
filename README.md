# Slush Pool JavaScript Library

[![Version](https://img.shields.io/npm/v/slushpool.svg)](https://www.npmjs.org/package/slushpool)
[![Try on RunKit](https://badge.runkitcdn.com/slushpool.svg)](https://runkit.com/npm/slushpool)

This unofficial Slush Pool library provides convenient access to the Slush Pool API from
client-side and server-side JavaScript applications.

## Installation
```sh
npm install slushpool
# or
yarn add slushpool
```

## Usage
The package needs to be configured with an access token from your Slush Pool account:
1. Log in to [Slush Pool](https://slushpool.com/login/).
1. Go to *Settings* > *Access Profiles*.
2. Select an existing access profile or create a new one.
3. Select *Allow access to web APIs* in the access profile details.
4. Click *Generate new token*.
5. Click *Save*.

```js
import slushpool from 'slushpool'

async function example() {
  slushpool.init('YOUR_SLUSH_POOL_ACCESS_TOKEN')
  const stats = await slushpool.stats()
  const profile = await slushpool.profile()
  const rewards = await slushpool.rewards()
  const workers = await slushpool.workers()
}
```

## Documentation
This library is a pretty lightweight wrapper around the Slush Pool API, so [Slush Pool's API documentation](https://help.slushpool.com/en/support/solutions/articles/77000433512-api-configuration-guide) is probably helpful.
It also includes type definitions, so it should be convenient for TypeScript folks.
