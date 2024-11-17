import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req,res)=>{
    const { username ,email ,password} = req.body;
    
try{
    // HASH THE PASS WORD
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);
       
//    console.log(hashedPassword);

    // create a user to save in the databse
    const newUser = await prisma.user.create({
        data: {
            username:username,
            email:email,
            password:hashedPassword,
        },

    });
    // console.log(newUser);
    res.status(201).json({message:"User created Successfully"});
}catch(err){
    console.error("Error creating user:", err);
    res.status(500).json({message:"Failed to Create user"})
}
            

    // create a new user and save it to the databse
    
};

export const login = async (req,res)=>{
    const{ username,password } = req.body;

    // Log received data for debugging
    //console.log('Received login request with:', { username, password });

     // check if the username or password is extracted or not
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Step 1: Check if the user exists
        const user = await prisma.user.findUnique({
            where: {username} 
        });

        // Step 2: If user does not exist
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Step 3: Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If passwords do not match
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

         // generate cookies or token and send to the user
        //res.setHeader("Set-Cookie","test=" + "myValue").json("success")
         const age = 1000 * 60 * 60 * 24 * 7 ;
         //  creating jwt token
         const token = jwt.sign(
        {
            id:user.id,
            isAdmin:true,
        },
        process.env.JWT_SECRET_KEY,
        {expiresIn:age}
        );

        const {password:userpassword , ...userInfo} = user

           res.cookie("token",token,{
            httpOnly: true,
            //secure:true,
            maxAge:age // 1 week
           })
           .status(200).json(userInfo);
          // console.log("user ka data ",userInfo);
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
    



export const logout = (req,res)=>{
    res.clearCookie("token").status(200).json({message:"Logout Succesful"})
}

