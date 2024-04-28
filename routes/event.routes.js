import {Router} from  'express';
import {upload} from  "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addEvent, allEvents } from '../controllers/events.controller.js';
const router = Router();

router.route('/addEvent').post(verifyJWT,
    upload.fields([
        {name: 'image', maxCount: 1}, ]),
    addEvent
    )
router.route('/allEvents').get(allEvents)
export default router