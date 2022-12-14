const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Conversation = require("../Models/Conversations");
const Message = require("../Models/Messages");

const newChat = async (req, res) => {
  console.log(req.body, "i am bopdy");
  const { senderId, receiverId, message, scanId, format } = req.body;
  if ((senderId, receiverId, message)) {
    let conversations = await Conversation.find({
      members: { $in: [senderId] },
    });

    let foundConversation = false;
    let foundConversationId;
    let i = 0;
    while (i < conversations?.length && foundConversation === false) {
      foundConversation = conversations[i].members.some(
        (member) => member === receiverId
      );
      if (foundConversation === true) {
        foundConversationId = conversations[i]._id;
      }
      i++;
    }

    console.log(foundConversation, "Found conversations");

    if (foundConversation === true) {
      res.json({
        serverError: 0,
        message: "You already have a conversation on going",
        data: {
          success: 0,
          chatExist: 1,
          conversationId: foundConversationId,
        },
      });
      return;
    }

    let membersData = await User.find(
      { _id: { $in: [senderId, receiverId] } },
      ["firstName", "lastName", "image"]
    );

    membersData = membersData.map((member) => {
      return {
        name: `${member.firstName} ${member.lastName}`,
        id: member._id.toString(),
        image: member.image,
      };
    });
    console.log(membersData);

    let createdConversation = new Conversation({
      members: [senderId, receiverId],
      membersData: membersData,
    });

    try {
      createdConversation.save((err, doc) => {
        if (err) {
          throw new Error("Error Creating the Chat");
        } else {
          console.log(doc, "doc there");
          if (format === "scanImage") {
            for (let i = 0; i < 2; i++) {
              if (i === 0) {
                let createdMessage = new Message({
                  conversationId: doc._id,
                  senderId: senderId,
                  message:
                    "Hi Doctor, please review my scans and let me know your feedback.",
                  format: "text",
                  scanId: scanId?.length > 0 ? scanId : "",
                });

                createdMessage.save((err) => {
                  if (err) {
                    throw new Error("Error Creating the message");
                  } else {
                    // res.json({
                    //   serverError: 0,
                    //   message: "Message Sent",
                    //   data: {
                    //     success: 1,
                    //   },
                    // });
                    return;
                  }
                });
              } else {
                let createdMessage = new Message({
                  conversationId: doc._id,
                  senderId: senderId,
                  message: message,
                  format: "scanImage",
                  scanId: scanId.length > 0 ? scanId : "",
                });

                createdMessage.save((err) => {
                  if (err) {
                    throw new Error("Error Creating the message");
                  } else {
                    // res.json({
                    //   serverError: 0,
                    //   message: "Message Sent",
                    //   data: {
                    //     success: 1,
                    //   },
                    // });
                    return;
                  }
                });
              }
            }
            res.json({
              serverError: 0,
              message: "Message Sent",
              data: {
                success: 1,
              },
            });
          } else {
            let createdMessage = new Message({
              conversationId: doc._id.toString(),
              senderId: senderId,
              message: message,
              format: format,
              scanId: scanId.length > 0 ? scanId : "",
            });

            createdMessage.save((err) => {
              if (err) {
                throw new Error("Error Creating the message");
              } else {
                res.json({
                  serverError: 0,
                  message: "Message Sent",
                  data: {
                    success: 1,
                  },
                });
                return;
              }
            });
          }
        }
      });
    } catch (err) {
      res.json({
        serverError: 1,
        message: err.message,
        data: {
          success: 0,
        },
      });
    }
  } else {
    res.json({
      message: "somthing is missing",
    });
  }
};

const getLastMessage = async (conversationId) => {
  console.log(conversationId, "get last msg");
  let foundMessages = await Message.find({ conversationId: conversationId })
    .sort({ _id: -1 })
    .skip(0)
    .limit(10);
  foundMessages = foundMessages.reverse();
  let lastMessage = foundMessages[foundMessages.length - 1];
  return lastMessage.message;
};

const getConversations = async (req, res) => {
  console.log(req.body, "i am body");
  try {
    let conversations = await Conversation.find({
      members: { $in: [req.body.userId] },
    });
    //console.log("convo in getconversations", conversations);
    let conversationsFiltered = [];
    for (let i = 0; i < conversations.length; i++) {
      console.log(conversations[i], "in for loop");
      let convoObj = {
        conversationId: conversations[i]._id,
        otherMemberId: conversations[i]?.members?.find(
          (memberId) => memberId !== req.body.userId
        ),
        otherMemberData: conversations[i].membersData.find((memberData) => {
          console.log(memberData, "i am memberdata");
          return memberData.id.toString() !== req.body.userId;
        }),
        lastMessage: await getLastMessage(conversations[i]._id),
        createdAt: conversations[i].createdAt,
        updatedAt: conversations[i].updatedAt,
      };
      conversationsFiltered.push(convoObj);
    }

    if (conversations?.length > 0) {
      res.json({
        serverError: 0,
        message: "Found conversations",
        data: {
          success: 1,
          conversations: conversationsFiltered,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "Found no conversations",
        data: {
          success: 0,
          conversations: conversations,
        },
      });
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

// const getConversations = async (req, res) => {
//   console.log(req.body, "i am body");
//   try {
//     let conversations = await Conversation.find({
//       members: { $in: [req.body.userId] },
//     });

//     let conversationsFiltered = conversations.map((convo) => {
//       console.log(convo, "i am cnvo");
//       return {
//         conversationId: convo._id,
//         otherMemberId: convo?.members?.find(
//           (memberId) => memberId !== req.body.userId
//         ),
//         otherMemberData: convo.membersData.find((memberData) => {
//           console.log(memberData, "i am memberdata");
//           return memberData.id.toString() !== req.body.userId;
//         }),
//         createdAt: convo.createdAt,
//         updatedAt: convo.updatedAt,
//       };
//     });

//     // console.log(conversationsFiltered);

//     if (conversations?.length > 0) {
//       res.json({
//         serverError: 0,
//         message: "Found conversations",
//         data: {
//           success: 1,
//           conversations: conversationsFiltered,
//         },
//       });
//     } else {
//       res.json({
//         serverError: 0,
//         message: "Found no conversations",
//         data: {
//           success: 0,
//           conversations: conversations,
//         },
//       });
//     }
//   } catch (err) {
//     res.json({
//       serverError: 1,
//       message: err.message,
//       data: {
//         success: 0,
//       },
//     });
//   }
// };

const getConversationMessages = async (req, res) => {
  console.log(req.body);
  const { conversationId, bottomHit, userId } = req.body;
  try {
    console.log("sea");
    let foundMessages = await Message.find({ conversationId: conversationId })
      .sort({ _id: -1 })
      .skip(bottomHit > 0 ? (bottomHit - 1) * 10 : 0)
      .limit(10);

    console.log(foundMessages, "foundMessages");
    foundMessages = foundMessages.map((msg) => {
      console.log(msg);
      return {
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        message: msg.message,
        format: msg.format,
        scanId: msg.scanId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        isSender: msg.senderId === userId ? "1" : "0",
      };
    });
    foundMessages = foundMessages.reverse();

    if (foundMessages.length > 0) {
      res.json({
        serverError: 0,
        message: "Messages Found",
        data: {
          success: 1,
          messages: foundMessages,
          lastMessage: foundMessages[foundMessages.length - 1],
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "No messages Found",
        data: {
          success: 0,
          messages: foundMessages,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const newMessage = async (req, res) => {
  console.log(req.body, "i am body");
  console.log(req.files, "i am files");
  const { conversationId, senderId, message, scanId, format } = req.body;
  try {
    // if ((conversationId, senderId, message)) {
    if (format === "scanImage") {
      for (let i = 0; i < 2; i++) {
        if (i === 0) {
          let createdMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            message:
              "Hi Doctor, please review my scans and let me know your feedback.",
            format: "text",
            scanId: scanId?.length > 0 ? scanId : "",
          });

          createdMessage.save((err) => {
            if (err) {
              throw new Error("Error Creating the message");
            } else {
              // res.json({
              //   serverError: 0,
              //   message: "Message Sent",
              //   data: {
              //     success: 1,
              //   },
              // });
              return;
            }
          });
        } else {
          let createdMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            message: message,
            format: "scanImage",
            scanId: scanId.length > 0 ? scanId : "",
          });

          createdMessage.save((err) => {
            if (err) {
              throw new Error("Error Creating the message");
            } else {
              // res.json({
              //   serverError: 0,
              //   message: "Message Sent",
              //   data: {
              //     success: 1,
              //   },
              // });
              return;
            }
          });
        }
      }
      res.json({
        serverError: 0,
        message: "Message Sent",
        data: {
          success: 1,
        },
      });
    } else {
      if (format === "image") {
        let filesName = [];
        if (req?.files?.length > 0) {
          console.log(req.files, "here are the files");
          filesName = req.files.map((file) => file.path);
        }
        let resolvedMessages = filesName.map((fileLink) => {
          console.log(fileLink, "i nam file link");
          let createdMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            message: fileLink,
            format: format,
            scanId: scanId?.length > 0 ? scanId : "",
          });
          try {
            let resolvedMessage = createdMessage.save();
            return resolvedMessage;
          } catch (err) {
            throw new Error("Something went wrong while saving message");
          }
        });
        try {
          let doneSaving = await Promise.all(resolvedMessages);
          console.log(doneSaving);
          res.json({
            serverError: 0,
            message: "Message Sent",
            data: {
              success: 1,
            },
          });
          return;
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while resolving messages");
        }
      } else {
        let createdMessage = new Message({
          conversationId: conversationId,
          senderId: senderId,
          message: message,
          format: format,
          scanId: scanId?.length > 0 ? scanId : "",
        });
        createdMessage.save((err) => {
          if (err) {
            throw new Error("Error Creating the message");
          } else {
            res.json({
              serverError: 0,
              message: "Message Sent",
              data: {
                success: 1,
              },
            });
            return;
          }
        });
      }
      return;
    }
    // } else {
    //   throw new Error("Somthing is missing");
    // }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const createMessage = async (data) => {
  console.log(data, "data in create msg");
  let { conversationId, senderId, message, scanId, format } = data;
  let createdMessage = new Message({
    conversationId: conversationId,
    senderId: senderId,
    message: message,
    format: format,
    scanId: scanId?.length > 0 ? scanId : "",
  });

  return await createdMessage.save((err) => {
    if (err) {
      throw new Error("Error Creating the message");
    } else {
      return {
        success: true,
        message: "message saved successfully",
      };
    }
  });
};

const createNewChat = async (data, textData) => {
  let { senderId, receiverId } = data;
  let membersData = await User.find({ _id: { $in: [senderId, receiverId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);

  membersData = membersData.map((member) => {
    return {
      name: `${member.firstName} ${member.lastName}`,
      id: member._id.toString(),
      image: member.image,
    };
  });
  console.log(membersData);

  let createdConversation = new Conversation({
    members: [senderId, receiverId],
    membersData: membersData,
  });
  await createdConversation.save(async (err, doc) => {
    if (err) {
      throw new Error("Error Creating the Chat");
    } else {
      await createMessage({ ...data, conversationId: doc._id });
      await createMessage({ ...textData, conversationId: doc._id });
    }
  });
};

const checkChatExist = async (conversations, receiverId) => {
  console.log(conversations, "in check chat exist");
  for (i = 0; i < conversations.length; i++) {
    for (j = 0; j < conversations[i].members.length; j++) {
      console.log(
        conversations[i].members[j],
        "receiverId in j loop",
        receiverId
      );
      if (conversations[i].members[j] == receiverId) {
        return conversations[i]._id;
      }
    }
  }
  return false;
};

const scanChatMessage = async (data, textData) => {
  console.log(data, "in scan chat message");
  let { senderId, receiverId, message, scanId, format } = data;
  // receiverId = await User.find({
  //   _id: { $in: [receiverId] },
  // });
  if ((senderId, receiverId, message)) {
    let conversations = await Conversation.find({
      members: { $in: [senderId] },
    });
    console.log(conversations, "conversations in scan chat message");
    let getConvoId = await checkChatExist(conversations, receiverId);
    console.log(getConvoId, "chat exist");
    if (getConvoId) {
      let isSaved = await createMessage({
        ...data,
        conversationId: getConvoId,
      });
      let isSavedText = await createMessage({
        ...textData,
        conversationId: getConvoId,
      });
      console.log(isSaved, "is saved");
      return;
    } else {
      console.log(receiverId, "receiverId");
      await createNewChat(data, textData);
    }
  } else {
    console.log("missing required details");
  }
};

module.exports = {
  newChat,
  getConversations,
  getConversationMessages,
  newMessage,
  scanChatMessage,
  createNewChat,
  createMessage,
};
