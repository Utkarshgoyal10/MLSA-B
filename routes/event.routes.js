import {Router} from  'express';
import {upload} from  "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addEvent, addImagesToEvent, allEventsupcoming,allEventspast, allEventssignin, allEventssupcoming } from '../controllers/events.controller.js';
const router = Router();

router.route('/addEvent').post(verifyJWT,
    upload.fields([
        {name: 'image', maxCount: 1}, ]),
    addEvent
    )
router.route('/allEventsupcoming').get(allEventsupcoming)
router.route('/allEventssupcoming').get(verifyJWT,allEventssupcoming)
router.route('/allEventspast').get(allEventspast)
router.route('/allEventss').get(verifyJWT,allEventssignin)
router.route('/addimage/c/:eventId').post(upload.array('image'),addImagesToEvent)

export default router