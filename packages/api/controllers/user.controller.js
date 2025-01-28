import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt';




export const getUsers = async (req,res) =>{
   try {
    // fetch the data from the db using prisma
      const users = await prisma.user.findMany();
      res.status(200).json(users);
   } catch (error) {
    console.log(error);
    res.status(500).json({message:"Failed to get Users"});
   } 

}





export const getUser = async (req,res) =>{
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where:{id},
        });
      res.status(200).json(user);
    } catch (error) {
     console.log(error);
     res.status(500).json({message:"Failed to get User"});
    } 
 
 }




 export const updateUser = async (req,res) =>{
    const id = req.params.id;
    const tokenUserId = req.UserId;
    const {password,avatar,...otherdata_to_update} = req.body;


    if(id !== tokenUserId){
        return res.status(403).json({message:"You are Not Authorized!!"})
    }
    let updatedPassword=null;
    const salt = 10;
    try {
        if(password){
            updatedPassword = await bcrypt.hash(password,salt);
        }
        const Updateduser = await prisma.user.update({
            where:{ id },
            data:{
               ...otherdata_to_update,
               ...(updatedPassword && {password: updatedPassword}),
               ...(avatar && {avatar}),
            },
        });


        const {password:userpasword,...rest} = Updateduser;
        res.status(200).json(rest);
     
    } catch (error) {
     console.log(error);
     res.status(500).json({message:"Failed to get update_User"});
    } 
 
 }




 export const deleteUser = async (req,res) =>{
    const id = req.params.id;
    const tokenUserId = req.UserId;
    
    if(id !== tokenUserId){
        return res.status(403).json({message:"You are Not Authorized!!"})
    }
    try {
     await prisma.user.delete({
        where:{id},
     })
     res.send(200).json({message:"User deleted Succesully"})
    } catch (error) {
     console.log(error);
     res.status(500).json({message:"Failed to get deleteUser"});
    } 
 
 }




//not use this it is working good




// export const savedPost = async (req, res) => {
//   console.log("saved post controller->>",req.body);
//  const Postid = req.body.postId;
//  const tokenUserId = req.UserId;
// //  console.log("inside saved post controller postid->>",Postid);
// //  console.log("inside saved post controller token -->",tokenUserId);

// const token = req.cookies?.token;

// if (!token) {
//   return res.status(403).json({ message: 'Token is missing' });
// }

// try{

//   jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
//     if (err) {
//       return res.status(403).json({ message: 'Token is invalid or expired' });
//     }
//     // valid user hai 
//             const savedPost = await prisma.SavedPost.findUnique({
//               where:{
//                 userId_postId:{
//                   userId:tokenUserId,
//                   postId:Postid,
//                 },
//               },
//             });

//             if(savedPost){
              
//               // no need to save the post again delete it 
//               await prisma.SavedPost.delete({
//                 where: {
//                   id:savedPost.id,
//                 },
//               });
//               res.status(200).json({ isSaved:false , message: "Post removed from Saved post Successfully!" });
//             }
//         //saved the post if not exists
//           else{
//             await prisma.SavedPost.create({
//               data: {
//                 userId: tokenUserId,
//                 postId: Postid,
//               },
//             });
//             res.status(200).json({isSaved:true, message: "Post Saved Successfully!" });
//           } 
//         });
//       }
//       catch (error) {
//         console.error("Error in Saving post:", error);
//         return res.status(500).json({ message: "Failed to Save post" });
//       }
//     };



 
export const savedPost = async (req, res) => {
    //console.log("saved post controller->>",req.body);
   const Postid = req.body.postId;
   const tokenUserId = req.UserId;
  //  console.log("inside saved post controller postid->>",Postid);
  //  console.log("inside saved post controller token -->",tokenUserId);
  


    try {
      const savedPost = await prisma.SavedPost.findUnique({
        where:{
          userId_postId:{
            userId:tokenUserId,
            postId:Postid,
          },
        },
      })
  
      if(savedPost){
        
        // no need to save the post again delete it 
        await prisma.SavedPost.delete({
          where: {
            id:savedPost.id,
          },
        });
        res.status(200).json({ message: "Post removed from Saved post Successfully!" });
      }
  //saved the post if not exists
    else{
      await prisma.SavedPost.create({
        data: {
          userId: tokenUserId,
          postId: Postid,
        },
      });
       res.status(200).json({ message: "Post Saved Successfully!" });
    } 
  } 
    
    
    
    catch (error) {
      console.error("Error in Saving post:", error);
      res.status(500).json({ message: "Failed to Save post" });
    }
  };
  


















  export const profilePosts = async (req,res) =>{
    const tokenUserId = req.UserId;
    //console.log('user ki id -->>>',tokenUserId)
    try {
     // here we are serching the post list posts
     
       const userPosts = await prisma.post.findMany({
        where:{ userId:tokenUserId },
       });
       // here we are serching the saved list posts
       const saved = await prisma.SavedPost.findMany({
        where:{userId:tokenUserId},
        include:{
          Post:true,
        },
       });
       
       //console.log("saved  ---> ",saved)
       const savedPosts = saved.map((item) => item.Post);
      //  console.log("user data ---> ",userPosts)
      //  console.log("saved data ---> ",savedPosts)

       res.status(200).json({userPosts,savedPosts});
    } catch (error) {
     console.log(error);
     res.status(500).json({message:"Failed to get Profile Posts"});
    } 
 
 };
 




 export const getNotificationNumber = async (req,res) =>{
  const tokenUserId = req.UserId;
  console.log("Inside the user controller token -->",tokenUserId);
  
  try {
     const number = await prisma.chat.count({
      where:{
        userIDs:{
          hasSome:[tokenUserId],
        },
        NOT:{
          seenBy:{
            hasSome:[tokenUserId],
          },
        },
      },
     });

     res.status(200).json(number);
    console.log("Inside the user controller  -->",number);
  } catch (error) {
   console.log(error);
   res.status(500).json({message:"Failed to get Notification number"});
  } 

};
