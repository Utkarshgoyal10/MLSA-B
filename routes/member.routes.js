// routes/memberRoutes.js
import {Router} from  'express';
import {upload} from  "../middlewares/multer.middleware.js"
import { getAllMembers, getMemberById, addMember, getAllMemberss } from "../controllers/member.controller.js";
// Route to get all members
const router = Router();

router.get('/Allmemberss', getAllMemberss);
router.get('/Allmembers', getAllMemberss);

// Route to get a specific member by ID
router.get('/members/:id', getMemberById);

// Route to add a new member
router.post('/addmember', upload.fields([
    {name: 'profileImage', maxCount: 1}]),
    addMember);

export default router;
