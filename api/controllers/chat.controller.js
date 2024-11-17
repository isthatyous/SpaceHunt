import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
    const tokenUserId = req.UserId;
  
    try {
      const chats = await prisma.Chat.findMany({
        where: {
            userIDs: {
                hasSome: [tokenUserId],
          },
        },
      });
  
      for (const chat of chats) {
        const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
  
        const receiver = await prisma.user.findUnique({
          where: {
            id: receiverId,
          },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });
        chat.receiver = receiver;
      }
  
      res.status(200).json(chats);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get chats!" });
    }
  };










export const getChat = async(req,res)=>{
    const tokenUserId = req.UserId;

    try {
        // find the chat using the chat IDs
        const chat = await prisma.Chat.findUnique({
            where:{
                id: req.params.id,
                userIDs: {
                    hasSome:[tokenUserId],
                },
            },
            include:{
                message:{
                    orderBy:{
                        createdAt: "asc",
                    },
                },
            },
        });

        //  here we will update the chats 
        await prisma.Chat.update({
            where: {
                id: req.params.id
            },
            data: {
                seenBy : {
                    push: [tokenUserId],
                },
            },
        });
        res.status(200).json(chat)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to get single chat!!"})
    }
}







export const addChat = async(req,res)=>{
    const tokenUserId = req.UserId;
    try {
        const newChat = await prisma.Chat.create({
            data:{
                userIDs:[tokenUserId,req.body.recieverId],
            },
        })
        res.status(200).json(newChat)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to add new chats!!"})
    }
}






export const readChat = async(req,res)=>{
    const tokenUserId = req.UserId;
    try {
       const readchat =  await prisma.Chat.update({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome:[tokenUserId],
                },
            },
            data: {
                seenBy : {
                    set: [tokenUserId],
                },
            },
        });
        res.status(200).json(readchat)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to get chats!!"})
    }
}





// export const readChat = async (req, res) => {
//     const tokenUserId = req.UserId;
  
//     try {
//       const chat = await prisma.Chat.findUnique({
//         where: {
//           id: req.params.id,
//           userIDs: {
//             hasSome:[tokenUserId],
//           },
//         },
//       });
  
//       if (!chat || !chat.userIDs.includes(tokenUserId)) {
//         return res.status(404).json({ message: "Chat not found or unauthorized" });
//       }
  
//       // Only mark as read if the current user hasn't seen it yet
//       if (!chat.seenBy.includes(tokenUserId)) {
//         const updatedChat = await prisma.Chat.update({
//           where: {
//             id: req.params.id,
//             userIDs:{
//                 hasSome:[tokenUserId],
//             }
//           },
//           data: {
//             seenBy: {
//               set: tokenUserId,
//             },
//           },
//         });
//         return res.status(200).json(updatedChat);
//       } else {
//         res.status(200).json(chat); // If already seen, return the chat without updating
//       }
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Failed to mark chat as read!" });
//     }
// }