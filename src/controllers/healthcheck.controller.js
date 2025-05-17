import {ApiResponse} from '../utils/Apiresponse.js'
import {asyncHandler} from "../utils/asycHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "OK", "Healthcheck Passed"));
    })


export {healthcheck};