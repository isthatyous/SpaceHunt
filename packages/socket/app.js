import {Server} from "socket.io";

const io = new Server({
    cors: {
        origin: "http://localhost:5173",
      },
});

let onlineUser = []

const addUser = (userId,socketId) =>{
    const userExists = onlineUser.find((user) => user.userId === userId);
    if(!userExists){
        onlineUser.push({userId , socketId});
    }
};

const removeUser = (socketId)=>{
     onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId)=>{
    return onlineUser.find((user) => user.userId === userId );

};


io.on("connection", (socket) => {
    socket.on("newUser",(userId)=>{
        addUser(userId, socket.id)
        //console.log("socket app.js -->",onlineUser);
    });

socket.on("sendMessage",({receiverId,data})=>{
    // console.log("socket ke andar -->",receiverId)
    // console.log("socket ke andar -->",data)
    
   const receiver = getUser(receiverId) ;
  

//    console.log("socket ke andar finding user-->",receiver)
   io.to(receiver.socketId).emit("getMessage",data)
});




    // diconnection when close the window 
    socket.on("disconnect",()=>{
        removeUser(socket.id);
    })
  });


  

   io.listen("4000");