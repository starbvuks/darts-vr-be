const Player = require("../models/Player");

async function sendFriendRequest(senderId, receiverId) {
  try {
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    // Check if the friend request already exists
    const existingRequest = sender.profile.sentRequests.find(
      (request) => request.receiverId.toString() === receiverId
    );

    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Create a new friend request
    const newRequest = { senderId, receiverId, timestamp: new Date() };

    sender.profile.sentRequests.push(newRequest);
    receiver.profile.receivedRequests.push(newRequest);

    await sender.save();
    await receiver.save();

    return { sender, receiver };
  } catch (error) {
    throw error;
  }
}

async function acceptFriendRequest(senderId, receiverId) {
  try {
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    // Find the received request with a 'pending' status
    const receivedRequestIndex = receiver.profile.receivedRequests.findIndex(
      (request) => request.senderId.equals(senderId) && request.status === 'pending'
    );

    if (receivedRequestIndex !== -1) {
      // Update the received request status to "accepted"
      receiver.profile.receivedRequests[receivedRequestIndex].status = "accepted";
      receiver.profile.receivedRequests[receivedRequestIndex].acceptedAt = new Date();

      // Add the sender and receiver as friends
      sender.profile.friends.push({
        friendId: receiverId,
        username: receiver.name,
        since: receiver.profile.receivedRequests[receivedRequestIndex].acceptedAt,
      });
      receiver.profile.friends.push({
        friendId: senderId,
        username: sender.name,
        since: receiver.profile.receivedRequests[receivedRequestIndex].acceptedAt,
      });

      await sender.save();
      await receiver.save();

      return { sender, receiver };
    } else {
      throw new Error("Friend request not found");
    }
  } catch (error) {
    throw error;
  }
}

async function declineFriendRequest(senderId, receiverId) {
  try {
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    // Find the received request with a 'pending' status
    const receivedRequestIndex = receiver.profile.receivedRequests.findIndex(
      (request) => request.senderId.equals(senderId) && request.status === 'pending'
    );

    if (receivedRequestIndex !== -1) {
      // Update the received request status to "denied"
      receiver.profile.receivedRequests[receivedRequestIndex].status = "denied";

      await receiver.save();
    } else {
      throw new Error("Friend request not found");
    }

    return receiver;
  } catch (error) {
    throw error;
  }
}

async function removeFriend(playerId, friendId) {
  try {
    const player = await Player.findById(playerId);

    // Remove the friend from the player's friends list
    player.profile.friends = player.profile.friends.filter(
      (friend) => !friend.friendId.equals(friendId)
    );

    await player.save();
    return player;
  } catch (error) {
    throw error;
  }
}

async function blockPlayer(playerId, blockedPlayerId) {
  try {
    const player = await Player.findById(playerId);

    // Check if the player is already blocked
    if (!player.profile.blocked.some((block) => block.playerId.equals(blockedPlayerId))) {
      // Add the blocked player to the player's blocked list
      player.profile.blocked.push({
        playerId: blockedPlayerId,
        since: new Date(),
      });

      await player.save();
    } else {
      throw new Error('Player is already blocked');
    }

    return player;
  } catch (error) {
    throw error;
  }
}


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockPlayer
};
