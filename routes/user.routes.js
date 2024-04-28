import {Router} from  'express';
import {getUserProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateprofileImage, watchHistory} from  "../controllers/user.controller.js";
import {upload} from  "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/register').post(
    upload.fields([
        {name: 'profileImage', maxCount: 1}, ]),
    registerUser
    )
router.route('/login').post(loginUser)
 
router.route('/logout').post(verifyJWT,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/updateAvtar').patch(verifyJWT,
    upload.fields([
        {name: 'profileImage', maxCount: 1}]),
    updateprofileImage
)
router.route( '/userProfile/:username' ).get(verifyJWT,getUserProfile );
router.route('/watch-History').get(verifyJWT, watchHistory);
export default router


//kya tuuh iska fronted ek baar apne backend backend se connect kar sakta taaki isk event page dekh sku 
