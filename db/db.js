import mongoose from 'mongoose'

const connectdb= async()=>{
    try{
        // const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/test`)
        const connectionInstance = await mongoose.connect(`mongodb+srv://utkarshgoyal07:Utkarsh123@backend.4xuvkvg.mongodb.net`)

        console.log(`\n mongodb connected \n ${connectionInstance.connection.host}`);
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}

export default connectdb

