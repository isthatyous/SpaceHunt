import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'

export const getPosts = async (req, res) => {
  const query = req.query;
  //console.log("inside the post controller", query);
  try {
    if (!prisma || !prisma.post) {
      throw new Error("Prisma client or post model is not available.");
    }

    const check = {
      city: query.city == "null" ? undefined : query.city,
      type: query.type == "any" ? undefined : query.type,
      property: query.property == "any" || "null"? undefined : query.property,
      bedroom: parseInt(query.bedroom) || undefined,
      price: {
        gte: parseInt(query.minPrice) || 0,
        lte: parseInt(query.maxPrice) || 1000000,
      },
    };

 ///   console.log("this is under check \n",check,"end\n")

    const allPosts = await prisma.post.findMany({
      where: {
        city: query.city == "" ? undefined : query.city,
        type: query.type == "any" ? undefined : query.type,
        property: query.property == "any" ||"null" ? undefined : query.property,
        bedroom: {
            gte:parseInt(query.bedroom) || undefined
        },
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 1000000,
        },
      },
    });

    // const posts = await prisma.post.findMany({
    //     where: {
    //         type : query.type == "any" ? undefined : query.type,
    //         property: query.property == "any" ? undefined : query.property,
                // bedroom: {
                //     gte:parseInt(query.bedroom) || undefined
                // },
    //         price: {
    //             gte: parseInt(query.minPrice) || 0,
    //             lte: parseInt(query.maxPrice) || 1000000,
    //           },
    //     }
    // })

    // console.log("\n\n Posts \n\n", posts, '\n\n end \n\n')

    // console.log( "\n\n all posts \n\n",allPosts);

    setTimeout(() => {
      res.status(200).json(allPosts);
    }, 1000);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to get posts" });
  }
};








// export const getPost = async (req, res) => {
//   const id = req.params.id;
// //  console.log("from the single post id->>",id);
//  // console.log("from the single post other data->>",req.params);
//   try {
//     const post = await prisma.post.findUnique({
//       where: { id },
//       include: {
//         postDetail: true,
//         user: {
//           select: {
//             username: true,
//             avatar: true,
//           },
//         },
//       },
//     });
//    // console.log("fetching single post \n",post,"end of fetching\n")
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" }); // Handle case when no post is found
//     }
//     // jb bhi ek single post ko fwtch kre to ye chek krna hai ki user logged in hai ki nhi 
//     // agr logged in hai to saved post dikhna chahiye agr kr rkha ho to
  
//     let isSaved = false;
//      const token = req.cookies?.token;

//      if(token){
//         // validate this token
//         jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, payload) => {
//           if (!err) {
//             // mtlb token shi hai 
//            const Saved = await prisma.SavedPost.findUnique({
//               where:{
//                 userId_postId:{
//                   userId:payload.id,
//                   postId:id,
//                 }
//               }
//             })
//           }
//         });
//     }
//     isSaved = !Saved;


//     res.status(200).json({...post,isSaved:Saved ? true : false});
//   } catch (error) {
//     console.error("Error fetching post:", error);
//     res.status(500).json({ message: "Failed to get post" });
//   }
// };






// export const getPost = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const post = await prisma.post.findUnique({
//       where: { id },
//       include: {
//         postDetail: true,
//         user: {
//           select: {
//             username: true,
//             avatar: true,
//           },
//         },
//       },
//     });

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res.status(200).json({...post,isSaved:false});
//   } catch (error) {
//     //console.error("Error fetching post:", error);
//     res.status(500).json({ message: "Failed to get post" });
//   }
// };




export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          return res.status(403).json({ message: 'Token is invalid or expired' });
        }
          const saved = await prisma.SavedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        
      });
    }
    else{
      return res.status(200).json({ ...post, isSaved: false });
    }
    //res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};








export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.UserId;
 // console.log(" create body->", body);
  //console.log(" create token data ->", tokenUserId);

  try {
    // Validate `tokenUserId` before proceeding
    if (!tokenUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};



export const updatePost = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }
    const updatedPost = await prisma.post.update({
      where: { id },
      data: body,
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
};



export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.UserId;
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
 //   console.log("delte post user id->", post.userId);
 //   console.log("delte token id->", tokenUserId);
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }
    await prisma.post.delete({ where: { id } });
    res.status(200).json({ message: "Deleted Successfully!" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};



