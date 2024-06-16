import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken
    const refreshToken = user.genrateRefreshToken
    
    user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false})

   return {accessToken, refreshToken}



  } catch (error) {
    throw new ApiError(500, "something went wrong while generating user token")
    
  }
}

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

const loginUser = asyncHandler( async (req, res) => {
  //req body se data lana hai.
  // username or email based access.
  // find the user
  // password check
  // access and refresh dono genrate krege and sendkrege user ko.
  // send the token in cookie

    //req body se data lana hai.
const { email, username, password} = req.body 

// username or email based access.
if(!username && !email) {
throw new ApiError(400, "username or password is required")
} 

// find the user
User.findOne({
$or: [{username}, {email}]
})

if(!user){
throw new ApiError(404,"User doesnot exist")
}

// password check 
const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
throw new ApiError(401,"Invalid user credentials")
}

//access and refresh dono genrate krege and sendkrege user ko.
const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
httpOnly: true,
secure: true
}

 // send the token in cookie
return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
new ApiResponse(
  200,
  {
    user: loggedInUser, accessToken,
    refreshToken
  },
  "User Logged In Successfully"
)
)

})

const logOutUSer = asyncHandler(async (req, res) =>{
//clear cookies
// reset refresh token

await User.findByIdAndUpdate (
  req.user._id,
  {
    $set: { 
      refreshToken: undefined
    }
  },
  {
    new: true
  }
)

const options = {
  httpOnly: true,
  secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))


})
  



export {
    registerUser,
    loginUser,
    logOutUSer
}
