//const asyncHandler = () => {}

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}

//for your understanding how it works!

//const asyncHandler = () => {}
//const asyncHandler = (function) => {}
//const asyncHandler = (function => async() => {})
/*
const asyncHandler = (fn) => async(req, res, next) => {
    try{
        await fn(req, res, next)
    }catch(error){
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
        
    }
}
    */