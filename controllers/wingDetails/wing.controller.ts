const uploadOnCloudinary = require("../../utils/cloudinary");
import { Redis } from "ioredis";
interface MulterRequest extends Request {
  files: any;
}
import { Request, Response } from "express";
import WingModel from "../../models/wing.model";
import EventModel from "../../models/event.model";
const redis = new Redis();
redis.on("connect", () => {
  console.log("Redis connected");
});

const addWingDetails = async (req: MulterRequest, res: Response) => {
  const { wingName, wingDescription, modalText, wingPoster } = req.body;
  console.log(wingName, wingDescription, modalText, wingPoster);
  try {
    const wing = await WingModel.create({
      wingName: wingName.toLowerCase(),
      wingDescription,
      modalText,
      wingPoster: wingPoster,
    });

    return res.status(200).json({
      message: "Wing added successfully",
      wing,
    });
  } catch (error) {
    console.error("Error adding wing:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWingDetails = async (req: Request, res: Response) => {
  try {
    const isWing = await redis.get(req.params.wingName + "details");
    const isEvents = await redis.get(req.params.wingName);

    if(isWing && isEvents){
      console.log("Data fetched from cache");
      const wing = await redis.get(req.params.wingName + "details");
      const events = await redis.get(req.params.wingName);

      if(!wing || !events){
        return res.status(500).json({
          message:"Internal server error"
        });
      }
      return res.status(200).json({
        wings:JSON.parse(wing),
        events:JSON.parse(events),
      });
    }
    const wings = await WingModel.find({ wingName: req.params.wingName });
    const events = await EventModel.find({ subCategory: req.params.wingName });
    await redis.setex(req.params.wingName+"details", 3600, JSON.stringify(wings));
    await redis.setex(req.params.wingName, 3600, JSON.stringify(events));
    return res.status(200).json({
      wings,
      events,
    });
  } catch (error) {
    console.error("Error getting wings:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export { addWingDetails, getWingDetails };
