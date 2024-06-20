const Player = require("../models/Player");

async function sendFriendRequest(senderId, receiverId) {
  const sender = await Player.findById(senderId);
  const receiver = await Player.findById(receiverId);

  if (!sender.friends.includes(receiverId)) {
    sender.sentRequests.push({ friendId: receiverId, timestamp: new Date() });
    await sender.save();

    
  }

  return sender;
}

async function acceptFriendRequest(senderId, receiverId) {
  const sender = await Player.findById(senderId);
  const receiver = await Player.findById(receiverId);

  if (receiver.receivedRequests.some(req => req.friendId.equals(receiverId))) {
    const index = receiver.receivedRequests.findIndex(req => req.friendId.equals(receiverId));
    const request = receiver.receivedRequests.splice(index, 1)[0];

    sender.friends.push({ friendId: receiverId, username: receiver.username, since: new Date() });
    receiver.friends.push({ friendId: senderId, username: sender.username, since: new Date() });

    await sender.save();
    await receiver.save();

  
  }

  return { sender, receiver };
}

async function declineFriendRequest(senderId, receiverId) {
  const sender = await Player.findById(senderId);
  const receiver = await Player.findById(receiverId);

  if (receiver.receivedRequests.some(req => req.friendId.equals(receiverId))) {
    const index = receiver.receivedRequests.findIndex(req => req.friendId.equals(receiverId));
    const request = receiver.receivedRequests.splice(index, 1)[0];

    await receiver.save();

  }

  return receiver;
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
};
