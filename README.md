# DARTS VR 2 API

### Core Modules:
  - **Player Authentication**
    - Playstation, Oculus, Steam
    - Access and Refresh Tokens
  - **Player Data**
    - User's Profile
    - Stats
    - Friends / Friend Requests
    - Cosmetics
    - Preferences
    - Achievements
  - **Friends / Social**
    - Send, Recieve, Accept, and Decline Friends Requests
    - Remove, Unsend, Block, and Unblock Friends
    - Platform wide player search
  - **Gamemodes**
    - ATW, Killstreak, Zombies, 501
    - Create, Invite, and Join a Private Match
    - Update, End and Get Matches
    - Matchmaking Services for Queueing up with random players
  - **League & Tournament**
    - Create, Join, Update, End and Get League Matches
    - Schedule, Join and Update Tournament Matches
  - **Redis Queues and Websockets**
    - Real-time notifications for all modules which require it
    - Redis Queues to handle matchmaking for all Gamemodes
  - **Data Models**:
    - Mongoose Models for Players, all the Gamemodes, Leagues, Tournaments + Matchups, and Cosmetics.
