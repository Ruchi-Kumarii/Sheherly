import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileMap = {
  medical: "medData.json",
  food: "foodData.json",
  transportation: "transData.json",
  local: "localData.json",
  accommodation: "accommodationData.json",
  famous: "famousSpots.json",
  safety: "policeData.json",
};

export const getCategoryData = async (req, res) => {
  try {
    const { category, type } = req.params;

    const fileName = fileMap[category];

    if (!fileName) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const filePath = path.join(__dirname, "..", "data", fileName);

    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);


    if (type) {
      if (!jsonData[type]) {
        return res.status(404).json({ message: "Subtype not found" });
      }
      return res.status(200).json(jsonData[type]);
    }


    if (category === "safety" && jsonData.police) {
      return res.status(200).json(jsonData.police);
    }

    return res.status(200).json(jsonData);

  } catch (error) {
    console.error("GET CATEGORY DATA ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch category data" });
  }
};

export const deleteCategoryItem = async (req, res) => {
  try {
    const { category, type, id } = req.params;

    const fileName = fileMap[category];

    if (!fileName) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const filePath = path.join(__dirname, "..", "data", fileName);

    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);


    if (type && jsonData[type]) {
      const originalLength = jsonData[type].length;
      jsonData[type] = jsonData[type].filter((item) => item.id !== id);

      if (jsonData[type].length === originalLength) {
        return res.status(404).json({ message: "Item not found" });
      }
    }


    else if (category === "safety" && Array.isArray(jsonData.police)) {
      const originalLength = jsonData.police.length;
      jsonData.police = jsonData.police.filter((item) => item.id !== id);

      if (jsonData.police.length === originalLength) {
        return res.status(404).json({ message: "Item not found" });
      }
    }

    else {
      return res.status(404).json({ message: "Invalid type/category structure" });
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });

  } catch (error) {
    console.error("DELETE CATEGORY ITEM ERROR:", error);
    return res.status(500).json({ message: "Failed to delete item" });
  }
};

export const addCategoryItem = async (req, res) => {
  try {
    const { category, type } = req.params;
    const newItem = req.body;

    const fileName = fileMap[category];

    if (!fileName) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const filePath = path.join(__dirname, "..", "data", fileName);

    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);

    if (type) {
      // Create the array for this type if it doesn't exist yet
      if (!Array.isArray(jsonData[type])) {
        jsonData[type] = [];
      }
      jsonData[type].push(newItem);
    } else if (category === "safety" && Array.isArray(jsonData.police)) {
      jsonData.police.push(newItem);
    } else {
      return res.status(404).json({ message: "Invalid type/category structure" });
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

    return res.status(201).json({
      success: true,
      message: "Item added successfully",
      data: newItem,
    });

  } catch (error) {
    console.error("ADD ITEM ERROR:", error);
    return res.status(500).json({ message: "Failed to add item" });
  }
};