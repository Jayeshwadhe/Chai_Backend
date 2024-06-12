import {mongoose, Schema} from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
    username: {
        type: String,
        requried: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        requried: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        requried: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //Cloudinary url
        requried: true
    },
    coverImage: {
        type: String, //Cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        requried: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
    },
{timestamps: true}
)

//pre passoword hash in database!
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)
    next()
})
//compairing password !
userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.method.genrateAccessToken = function(){
    return Jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.method.genrateRefreshToken = function(){
    return Jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)