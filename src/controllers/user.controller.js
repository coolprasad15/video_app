import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { upload } from '../middlewares/multer.middleware.js';
import { apiResponse } from '../utils/apiResponse.js';

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generatateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Somethin went wrong while generating tokens!");
    }
}

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
    
    const {email, username, fullName, password} = req.body
    // console.log("email: ", email);

    if ([fullName, email, password, username].some((field) => field?.trim === "")) {
        throw new ApiError(400, "All fields are required!");
    }

    const exsitingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(exsitingUser){
        throw new apiError(409, "User already exists with username or email!");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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

const loginUser = asyncHandler(async (req, res) => {
    
    const {email, username, password} = req.body;

    if(!username && !email){
        throw new apiError(400, "Username or email is required!");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if (!user) {
        throw new apiError(404, "User not found!");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new apiError(401, "Invalid password!");
    }

    const { accessToken, refreshToken } =await generateAccessAndRefreshToken(user._id);

    await User.findById(user._id).select("-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new apiResponse(200,
            {
                user: loginUser, accessToken, refreshToken
            },
            "User loggined in successfully!"
        )
    )

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $usset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option).
    json(
        new apiResponse(200, {}, "User logged out successfully!")
    )
});

export {
    registerUser,
    loginUser,
    logoutUser
};