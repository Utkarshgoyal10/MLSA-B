import {Router} from  'express';
import {upload} from  "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addEvent, addImagesToEvent, allEvents, allEventssignin } from '../controllers/events.controller.js';
const router = Router();

router.route('/addEvent').post(verifyJWT,
    upload.fields([
        {name: 'image', maxCount: 1}, ]),
    addEvent
    )
router.route('/allEvents').get(allEvents)
router.route('/allEventss').get(verifyJWT,allEventssignin)
router.route('/addimage/c/:eventId').post(upload.array('image'),addImagesToEvent)

export default router