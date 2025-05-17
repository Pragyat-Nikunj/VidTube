# VidTube Backend API

A production-ready RESTful API for a video-sharing platform (like YouTube), built with Node.js, Express, and MongoDB. Supports full user auth, video uploads, social interactions, and dashboard analytics.

🔗 Live API: https://vidtube-ke5w.onrender.com/api/v1

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Live Demo](#live-demo)
- [Postman Testing](#postman-testing)
- [Usage & Endpoints](#usage--endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication & authorization (JWT)
- Video upload (with thumbnails) via `multer`
- CRUD operations for videos, comments, playlists, tweets, likes, subscriptions
- Pagination & filtering support
- Dashboard stats for channels
- CORS & cookie handling
- Centralized error handling

## Tech Stack
- **Backend**: Node.js & Express
- **Database**: MongoDB & Mongoose
- **Uploads**: Multer + Cloudinary
- **Auth**: JWT
- **DevTools**: Nodemon
- **Hosting**: Render

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB instance
- npm or yarn

### Installation
```bash
git clone https://github.com/yourusername/VidTube.git
cd VidTube
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=<your_node_enviroment>              
PORT=<your_port>
CORS_ORIGIN=<your_cors_origin>                     
MONGODB_URL=<your_mongodb_connection_string>

# JWT settings
ACCESS_TOKEN_SECRET=<your_access_token_secret>
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary settings
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

### Running the Server
```bash
npm run dev      # with nodemon
```
Server will run at `http://localhost:${PORT}`.

## Live Demo

Access and test the public API without any local setup:

Base URL  
```
https://vidtube-ke5w.onrender.com/api/v1
```

Quick examples:

```bash
# 1. Check service health
curl https://vidtube-ke5w.onrender.com/api/v1/healthcheck

# 2. List all videos
curl https://vidtube-ke5w.onrender.com/api/v1/videos/getAllVideos

# 3. View a specific video by ID
curl https://vidtube-ke5w.onrender.com/api/v1/videos/getVideoById/<videoId>

# 4. Register a new user (replace payload as needed)
curl -X POST https://vidtube-ke5w.onrender.com/api/v1/users/register \
     -H "Content-Type: application/json" \
     -d '{"username":"john","email":"john@example.com","password":"secret"}'
```

## Postman Testing

Validate and explore the API with the included Postman collection:

1. Import `postman_tests/VidTube.postman_collection.json` into Postman.  
2. Create an environment (e.g. “VidTube”) with variable:  
   - `VidTube` = `https://vidtube-ke5w.onrender.com/api/v1`  
     (or `http://localhost:3000/api/v1` for local testing)  
3. Select the environment and run individual requests or use the Collection Runner.  
4. Inspect responses, update variables, and chain requests as needed.

## Usage & Endpoints

> Base URL: `/api/v1`
> Protected routes require `Authorization: Bearer <token>`

---

###  Healthcheck

* `GET /healthcheck`
  Check if the API is live.

---

###  Users

* `POST /users/register`
  Register a new user.

* `POST /users/login`
  Log in and receive access + refresh tokens.

* `POST /users/refresh-Token`
  Get a new access token using a refresh token.

* `GET /users/current-user` *(protected)*
  Get the currently authenticated user.

* `PATCH /users/update-account` *(protected)*
  Update user account details.

* `PATCH /users/update-avatar` *(protected)*
  Upload or update profile avatar.

* `GET /users/history` *(protected)*
  Get watch history of the user.

* `POST /users/logout` *(protected)*
  Log out the user and clear tokens.

---

###  Videos

* `GET /videos/getAllVideos`
  Retrieve all published videos.

* `GET /videos/getVideoById/:videoId`
  Get a specific video by its ID.

* `POST /videos/publishVideo` *(protected)*
  Upload a new video with thumbnail.

* `PATCH /videos/updateVideo/:videoId` *(protected)*
  Update details of an existing video.

* `DELETE /videos/deleteVideo/:videoId` *(protected)*
  Delete a specific video.

* `PATCH /videos/togglePublish/:videoId` *(protected)*
  Toggle video visibility (public/private).

---

###  Comments

* `GET /comments/videoComments/:videoId`
  Get all comments for a specific video.

* `POST /comments/addComment/:videoId` *(protected)*
  Add a new comment to a video.

* `PATCH /comments/updateComment/:commentId` *(protected)*
  Edit a comment by its ID.

* `DELETE /comments/deleteComment/:commentId` *(protected)*
  Delete a comment by its ID.

---

###  Likes

* `POST /likes/video/:videoId` *(protected)*
  Like or unlike a video.

* `POST /likes/comment/:commentId` *(protected)*
  Like or unlike a comment.

* `POST /likes/tweet/:tweetId` *(protected)*
  Like or unlike a tweet.

* `GET /likes/videos` *(protected)*
  Get all liked videos by the user.

---

###  Playlists

* `POST /playlist/createPlaylist` *(protected)*
  Create a new playlist.

* `GET /playlist/user/:userId`
  Get all playlists of a user.

* `GET /playlist/:playlistId`
  Get a single playlist by ID.

* `PUT /playlist/:playlistId/videos/:videoId` *(protected)*
  Add a video to a playlist.

* `DELETE /playlist/:playlistId/videos/:videoId` *(protected)*
  Remove a video from a playlist.

* `DELETE /playlist/:playlistId` *(protected)*
  Delete a playlist.

* `PATCH /playlist/:playlistId` *(protected)*
  Rename or update a playlist.

---

###  Tweets

* `GET /tweets/getUserTweets/:userId`
  Get all tweets by a specific user.

* `POST /tweets/createTweet` *(protected)*
  Create a new tweet.

* `PATCH /tweets/updateTweet/:tweetId` *(protected)*
  Update an existing tweet.

* `DELETE /tweets/deleteTweet/:tweetId` *(protected)*
  Delete a tweet by ID.

---

###  Subscriptions

* `GET /subscription/channelSubscriberCount/:channelId`
  Get total subscribers for a channel.

* `GET /subscription/subscribedChannels/:subscriberId` *(protected)*
  Get channels the user has subscribed to.

* `GET /subscription/channelSubscribers/:channelId` *(protected)*
  Get all users subscribed to a channel.

* `POST /subscription/subscribe/:channelId` *(protected)*
  Subscribe or unsubscribe to a channel.

---

###  Dashboard

* `GET /dashboard/channelStats/:channelId` *(protected)*
  Get analytics and stats for a channel.

* `GET /dashboard/channel/videos/:channelId` *(protected)*
  List all videos uploaded by the channel.


## Project Structure
```
VidTube/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   └── app.js
├── public/
├── .env
├── README.md
└── package.json
```

## Contributing
1. Fork repository  
2. Create feature branch  
3. Commit & push  
4. Open a Pull Request  

Please follow the code style and include tests where appropriate.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.


