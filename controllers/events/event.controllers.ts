import { Request, Response } from "express";

import EventModel from "../../models/event.model";
import { Redis } from "ioredis";

const nodemailer = require("nodemailer");

const mailTemplate = require("../../template/mailTemplate");

const redis = new Redis();
redis.on("connect", () => {
  console.log("Redis connected");
});

interface MulterRequest extends Request {
  files: any;
}

const addEvents = async (req: MulterRequest, res: Response) => {
  try {
    const data = JSON.parse(req.body.data);
    console.log(data);

    console.log(data.teamsize);

    const event = await EventModel.create({
      eventName: data.name,
      description: data.description,
      registrationFees: data.registrationFees,
      subCategory: data.subCategory.toLowerCase(),
      rulebook: data.rulebook,

      date: data.date,
      prizePool: data.prizePool,
      eventPoster: data.imgUrl,
      coordinators: data.coordinators,
      teamsize: data.teamsize,
    });
    return res.status(200).json({
      message: "Event added successfully",
      // event,
    });
  } catch (error) {
    console.error("Error adding event:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getEvents = async (req: Request, res: Response) => {
  try {
    const subCategory = req.params.subCategory as string | undefined;

    if (!subCategory) {
      return res.status(400).json({
        message: "Subcategory parameter is required",
      });
    }

    const isExists = await redis.exists(subCategory);

    if (isExists) {
      console.log("Fetching from cache");
      const events = await redis.get(subCategory);

      if (!events) {
        return res.status(404).json({
          message: "Events not found in cache",
        });
      }

      return res.status(200).json({
        message: "Events fetched successfully",
        events: JSON.parse(events),
      });
    }

    const events = await EventModel.find({ subCategory });
    await redis.setex(subCategory, 3600, JSON.stringify(events));
    return res.status(200).json({
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getIndividualEvent = async (req: Request, res: Response) => {
  try {
    const _id = req.params.eventId;
    console.log(_id);
    const isExists = await redis.exists(_id);

    if (isExists) {
      console.log("Fetching from cache");
      const event = await redis.get(_id);
      if (!event) {
        return res.status(404).json({
          message: "Event not found in cache",
        });
      }
      return res.status(200).json({
        message: "Event fetched successfully",
        event: JSON.parse(event),
      });
    }
    const event = await EventModel.findOne({ _id });
    await redis.setex(_id, 3600, JSON.stringify(event));

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }
    return res.json({
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// const getAllEvents = async (req: Request, res: Response) => {
//   try {
//     console.log("test");
//     const events = await WingModel.find();
//     console.log(events);
//     return res.status(200).json({
//       message: "Events fetched successfully",
//       events,
//     });
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };
const deleteEvent = async (req: Request, res: Response) => {
  try {
    const _id = req.params.eventId;
    const event = await EventModel.findOneAndDelete({ _id });
    await redis.del(_id);
    //get the subcategory of the event and invalidate the cache of that subcategory after deletion
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.json({
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  addEvents,
  getEvents,
  getIndividualEvent,
  deleteEvent,
  // getAllEvents,
};
