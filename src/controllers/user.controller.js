import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { upload } from '../middlewares/multer.middleware.js';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // return res.status(200).json({
    //     message: "Ok"
    // })

    //req body
    //validations
    //user already exists
    //check image
    //upload cloundinary
    //user object and create entry
    //removr password and refresh token
    //check user create
    //successfull

    console.log("req.body: ", req.body);
    
    const {email, username, fullName, password} = req.body
    // console.log("email: ", email);

    if(
        [email, username, fullName, password].some((field) => field?.trim() === "")
    ){
        throw new apiError(400, "Full name is required");
    }

    const existedUser = User.findOne({
        $or: [ { username }, { email }]
    });
    console.log("existedUser: ", existedUser);

    if(existedUser){
        throw new apiError(409, "User already exists with username or email!");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar and is required!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar file is required!");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new apiError(500, "Something went wrong when created user!");
    }

    return res.status(201)
    .json(
        new apiResponse(200, createdUser, "User register successfully!")
    );

});

export { registerUser };