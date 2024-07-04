const Player = require("../models/Player");

async function sendFriendRequest(senderId, receiverId) {
  try {
    // Check if the sender and receiver are already friends
    if (
      (await Player.exists({
        _id: senderId,
        "profile.friends.friendId": receiverId,
      })) ||
      (await Player.exists({
        _id: receiverId,
        "profile.friends.friendId": senderId,
      }))
    ) {
      return { error: "You are already friends" };
    }

    // Check if there's an existing pending friend request
    if (
      (await Player.exists({
        _id: senderId,
        "profile.sentRequests.receiverId": receiverId,
        "profile.sentRequests.status": "pending",
      })) ||
      (await Player.exists({
        _id: receiverId,
        "profile.receivedRequests.senderId": senderId,
        "profile.receivedRequests.status": "pending",
      }))
    ) {
      return { error: "Request already made and is pending" };
    }

    if (
      (await Player.exists({
        _id: senderId,
        "profile.receivedRequests.senderId": receiverId,
        "profile.receivedRequests.status": "pending",
      })) ||
      (await Player.exists({
        _id: receiverId,
        "profile.sentRequests.receiverId": senderId,
        "profile.sentRequests.status": "pending",
      }))
    ) {
      return { error: "Player has already sent you a pending request" };
    }

    // Proceed with querying the database and creating the friend request
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

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

async function unsendFriendRequest(senderId, receiverId) {
  try {
    // Check if the sender and receiver are already friends
    if (
      (await Player.exists({
        _id: senderId,
        "profile.friends.friendId": receiverId,
      })) ||
      (await Player.exists({
        _id: receiverId,
        "profile.friends.friendId": senderId,
      }))
    ) {
      return { error: "You are already friends" };
    }

    if (
      (await Player.exists({
        _id: senderId,
        "profile.receivedRequests.senderId": receiverId,
        "profile.receivedRequests.status": "pending",
      })) ||
      (await Player.exists({
        _id: receiverId,
        "profile.sentRequests.receiverId": senderId,
        "profile.sentRequests.status": "pending",
      }))
    ) {
      return { error: "Prohibited" };
    }

    // Proceed with querying the database and creating the friend request
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    receiver.profile.receivedRequests =
      receiver.profile.receivedRequests.filter(
        (request) => !request.senderId.equals(senderId)
      );

    sender.profile.sentRequests = sender.profile.sentRequests.filter(
      (request) => !request.receiverId.equals(receiverId)
    );

    await sender.save();
    await receiver.save();

    return { sender, receiver };
  } catch (error) {
    throw error;
  }
}

async function acceptFriendRequest(senderId, receiverId) {
  try {
    // Check if the sender and receiver are already friends
    if (
      await Player.exists({
        _id: senderId,
        'profile.friends.friendId': receiverId,
      }) ||
      await Player.exists({
        _id: receiverId,
        'profile.friends.friendId': senderId,
      })
    ) {
      return { error: "You are already friends" };
    }

    // Check if the received friend request exists
    const receivedRequest = await Player.exists({
      _id: receiverId,
      'profile.receivedRequests.senderId': senderId,
      'profile.receivedRequests.status': 'pending',
    });

    if (!receivedRequest) {
      return { error: "Friend request not found" };
    }

    // Proceed with accepting the friend request
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    receiver.profile.friends.push({
      friendId: senderId,
      status: "online",
      since: new Date(),
    });
    sender.profile.friends.push({
      friendId: receiverId,
      status: "online",
      since: new Date(),
    });

    receiver.profile.receivedRequests =
      receiver.profile.receivedRequests.filter(
        (request) => !request.senderId.equals(senderId)
      );

    sender.profile.sentRequests = sender.profile.sentRequests.filter(
      (request) => !request.receiverId.equals(receiverId)
    );

    await sender.save();
    await receiver.save();

    return { sender, receiver };
  } catch (err) {
    throw err;
  }
}

async function declineFriendRequest(senderId, receiverId) {
  try {
    // Check if the sender and receiver are friends
    if (
      await Player.exists({
        _id: senderId,
        'profile.friends.friendId': receiverId,
      }) ||
      await Player.exists({
        _id: receiverId,
        'profile.friends.friendId': senderId,
      })
    ) {
      return { error: "You are already friends" };
    }

    // Check if the received friend request exists
    const receivedRequest = await Player.exists({
      _id: receiverId,
      'profile.receivedRequests.senderId': senderId,
      'profile.receivedRequests.status': 'pending',
    });

    if (!receivedRequest) {
      return { error: "Friend request not found" };
    }

    // Proceed with accepting the friend request
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    receiver.profile.receivedRequests =
      receiver.profile.receivedRequests.filter(
        (request) => !request.senderId.equals(senderId)
      );

    sender.profile.sentRequests = sender.profile.sentRequests.filter(
      (request) => !request.receiverId.equals(receiverId)
    );

    await sender.save();
    await receiver.save();

    return { sender, receiver };
  } catch (err) {
    throw err;
  }
}

async function removeFriend(senderId, receiverId) {
  try {
    // Check if the sender and receiver are friends
    const areFriends = await Player.exists({
      _id: { $in: [senderId, receiverId] },
      'profile.friends.friendId': { $in: [senderId, receiverId] },
    });

    if (!areFriends) {
      return { error: "Invalid: these players are not friends" };
    }

    // Proceed with removing the friend
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    sender.profile.friends = sender.profile.friends.filter(
      (friend) => !friend.friendId.equals(receiverId)
    );

    receiver.profile.friends = receiver.profile.friends.filter(
      (friend) => !friend.friendId.equals(senderId)
    );

    await sender.save();
    await receiver.save();

    return { sender, receiver };
  } catch (err) {
    throw err;
  }
}

async function blockPlayer(senderId, receiverId) {
  try {
    // Check if the player is already blocked
    const isBlocked = await Player.exists({
      _id: senderId,
      'profile.blocked.playerId': receiverId,
    });

    if (isBlocked) {
      return { error: "Player is already blocked" };
    }

    // Proceed with blocking the player
    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    // Remove any existing friend requests between the sender and receiver
    sender.profile.sentRequests = sender.profile.sentRequests.filter(
      (request) => !request.receiverId.equals(receiverId)
    );
    receiver.profile.receivedRequests = receiver.profile.receivedRequests.filter(
      (request) => !request.senderId.equals(senderId)
    );

    // Remove the sender and receiver from each other's friend list
    sender.profile.friends = sender.profile.friends.filter(
      (friend) => !friend.friendId.equals(receiverId)
    );
    receiver.profile.friends = receiver.profile.friends.filter(
      (friend) => !friend.friendId.equals(senderId)
    );

    // Add the receiver to the sender's blocked list
    sender.profile.blocked.push({
      playerId: receiverId,
      username: receiver.username,
      since: new Date(),
    });

    // Save the updated player documents
    await sender.save();
    await receiver.save();

    return { sender, receiver };
  } catch (error) {
    throw error;
  }
}



module.exports = {
  sendFriendRequest,
  unsendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockPlayer,
};

