# Yawarakai Core

A running core that support many neural network models which works for NLP or providing solution   
Based on Telegram Bot API and CLI for the main interfaces

## Installation
```
git clone https://github.com/hanamiyuna/yawarakai.git
npm install # or yarn install
```

## Configuration
```
cp config.js.example config.json
# Edit the info inside config.json
```

## Start an instance
```
npm start
# or
node app.js start
# add --debug flag if you want it to be debug mode
node app.js start --debug
```

## Component API

Yawarakai provides a dynamical and powerful API for users to control the message flows and the way the users could do through the core system

## Credits

Translation by [KagurazakaIzumi](https://github.com/KagurazakaIzumi)

## Change log

### 1.4.2
1. Code organization according to Codacy
2. Database seperated into different groups
3. Feature: Scene added and component API adapted   
Scene is designed for the stage control, **scene**, which is the meaning itself,
the situation. Based on different situation, messages or commands may be
processed differently, this won't effect the inline, channel post, callbackquery.   
Scene will only take place when the message or the trigger command has been 
executed, when a user is inside the scene, Yawarakai will ignore the other
message distributor or the processor to the other components, the user's
message will be redirected to the scene registered function to process in its
own.
This made a great experience where you need to make a wizard or make a short or
'question' based setup while in the interaction with user.
4. Formal documentation added
5. Two of the official component updated with Scene feature   

### 1.4.1
**Discontinued the Redis server support of this project.**
We now use NeDB for the local database storage.   
1. Redis is now not used in this project and has been removed and related localization and config settings
2. Logs now will be saved into `logs` according to the regulation of Node.js project
3. Settings of database files is inside of the config file, update before startup
4. Fixed the flight component when the String of flight number cannot be matched in AA-0000 pattern
5. Fixed the musicshare component where the tag of song #s12345678 missing with letter `s`
6. Fixed the NLP display error after using NeDB

### 1.4.0
1. Added base command `/info`, `/help`, `/start`
2. Diagnostic log updated with new component feature
3. Message log format has been changed
4. Admin settings now available
5. Added commands for official component MusicShare
6. Fixed sendChatAction error
7. Fixed NLP processing issue
8. Fixed many issue   
   
### 1.3.0
1. Added `ja-JP` as Japanese support
2. Fixed the issue about flight and wiki inline query

### 1.2.6
1. Added `zh-TW` as Chinese (Taiwan) support
2. Added `zh-HK` as Chinese (Hongkong) support
3. Added the feature that locale files will be automatically loaded
4. Added some detail for components
5. Added a new component `flight` as official component with flight search and track
6. Fixed MusicShare hashtag, commands, and data processing issue
7. Fixed several processing issue with commands and messages

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhanamiyuna%2Fyawarakai.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhanamiyuna%2Fyawarakai?ref=badge_large)

[![forthebadge](https://forthebadge.com/images/badges/contains-cat-gifs.svg)]()  [![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)]()  [![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)]()  [![forthebadge](https://forthebadge.com/images/badges/just-plain-nasty.svg)]()
