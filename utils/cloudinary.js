import {v2 as cloudinary} from "cloudinary";
// import { log } from 'console';
import fs from "fs"  





// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary.config({ 
cloud_name: "dvh3ndrgx", 
api_key: "726641921536129", 
api_secret: "YULv4T3SmHowzjiHcocA4MFLPvE",
});



const uploadOnCloudinary = async (localFilePath) => {
  // console.log(process.env.CLOUDINARY_CLOUD_NAME, 
  //   process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
    try {
        if(!localFilePath) return null
        // console.log(localFilePath)

        // const response = await upload(localFilePath,{resource_type : "auto"})
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{resource_type : "auto"})
                         
        fs.unlinkSync(localFilePath)
        console.log("file uploaded");

        // file has been uploaded
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async (publicId) =>{
    try {
        console.log("Old Url::",publicId)
        const arr = (publicId.split('/'))
        const arr2=arr[arr.length-1].split('.')[0]
        const resultt = await cloudinary.uploader.destroy(arr2,(error,result)=>{
            console.log(result ,"  deleted");
        });
        console.log(resultt);
        console.log('File deleted successfully.');
      } catch (error) {
        console.error('Error deleting file:', error);
      }
}



export {uploadOnCloudinary,deleteFromCloudinary};