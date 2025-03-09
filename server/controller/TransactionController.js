import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// Get all transactions, grouped by month
export const index = async (req, res) => {
  try {
    const transaction = await Transaction.aggregate([
      {
        $match: { user_id: req.user._id },
      },
      {
        $group: {
          _id: { $month: "$date" },
          transactions: {
            $push: {
              amount: "$amount",
              description: "$description",
              date: "$date",
              _id: "$_id",
              category_id: "$category_id",
            },
          },
          totalExpenses: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ data: transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new transaction
export const create = async (req, res) => {
  const { amount, description, date, category_id } = req.body;

  // Check if category_id is provided
  if (!category_id) {
    return res.status(400).json({ error: "category_id is required" });
  }

  // Validate if category_id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(category_id)) {
    return res.status(400).json({ error: "Invalid category_id" });
  }

  try {
    const transaction = new Transaction({
      amount,
      description,
      user_id: req.user._id,
      date,
      category_id: new mongoose.Types.ObjectId(category_id), // Ensure ObjectId format
    });

    await transaction.save();
    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a transaction
export const destroy = async (req, res) => {
  try {
    await Transaction.deleteOne({ _id: req.params.id });
    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a transaction
export const update = async (req, res) => {
  try {
    await Transaction.updateOne({ _id: req.params.id }, { $set: req.body });
    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
