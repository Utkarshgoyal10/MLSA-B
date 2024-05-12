import {Router} from  'express';
import {upload} from  "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { dashboard } from '../controllers/dashboard.controller.js';
const router = Router();

router.route('/dashboard').get(verifyJWT,
    
    dashboard
    )
export default router