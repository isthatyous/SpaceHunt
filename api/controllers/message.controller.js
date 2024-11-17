import prisma from "../lib/prisma.js";

export const addMessage = async(req,res)=>{
    //console.log("inside the message")
    const tokenUserId = req.UserId;
    const chatId = req.params.chatId;
    const text = req.body.text;
    // console.log("inside message controller",chatId);
    // console.log("inside message controller",text);
    try {
        // first check this belonags to us or not 
      const chat =  await prisma.Chat.findUnique({
            where: {
                id : chatId,
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
        });
        if(!chat){
            res.status(404).json({message: "chat not found"})
        }
        // exists -> create our message 
        const message  = await prisma.Message.create({
            data:{
                text,
                chatId,
                userId: tokenUserId,
                
            },
        });
        // update  the seen by and last message
         await prisma.Chat.update({
            where: {
                id: chatId,
            },
            data: {
                seenBy :[tokenUserId],
                lastMessage: text,   
                
            },
        });
        res.status(200).json(message)
        //console.log("inside message controller what sending",message);
        

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to get chats!!"})
    }
}






