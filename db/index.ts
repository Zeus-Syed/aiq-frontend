import * as mongoose from "mongoose";

export const dbConnect = async () => {
  
    mongoose
      .connect('mongodb://127.0.0.1:27017/aiq', {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(() => console.log("connected"))
      .catch((err) => console.log("error ", err));

    console.log(true, typeof true);
    mongoose.set("debug",true);
  
};

export const dbClose = () => {
  return mongoose.disconnect();
};
