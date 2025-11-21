import User from "../models/User.js";

export const createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};
