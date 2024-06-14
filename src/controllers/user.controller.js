import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";



const registerUser = asyncHandler( async (req , res) => {
    //get user details from frontend
    // validation - not empty
    // check if user already exists: check by username, email
    // check for images, check for avatar
    // upload them to cloudinary, check for avatar again.
    // create user object -create entry in db
    // remove password and refresh token field from response.
    // check for user creation 
    // return res
     const {fullName, email, username, password} = req.body
     
   if (
    [fullName, email, username, password].some((field) => {
      field?.trim() === ""
    })
   ) {
        throw new ApiError(400, "All fields are required!")
   }
const existedUser = await User.findOne({
    $or: [{ username }, { email }]
}) 
   if(existedUser){
    throw new ApiError(409, "User with email or username already exist !")
   }
 //  const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let avatarLocalPath;
   if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
    avatarLocalPath = req.files.avatar[0].path;
  }

   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImageLocalPath = req.files.coverImage[0].path
   }
   
/*
   if (!avatarLocalPath) {
       throw new ApiError(400, "Avatar file is required0")
   }  
*/
 //  const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
/*
   if (!avatar) {
       throw new ApiError(400, "Avatar file is required1")
   }   
*/
    // create user object -create entry in db

   const user = await User.create({
        fullName,
        avatar: "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response.
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )
    // check for user creation 
      if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
        
      }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
          





})

export {
    registerUser
}
