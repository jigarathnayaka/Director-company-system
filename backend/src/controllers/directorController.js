import {
  getAllDirectors,
  getCompaniesByDirector
} from "../services/databaseService.js";

export async function listDirectors(req, res) {
  try {
    const directors = await getAllDirectors();

    return res.json({
      success: true,
      data: directors
    });
  } catch (error) {
    console.error("List directors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch directors."
    });
  }
}

export async function directorCompanies(req, res) {
  try {
    const directorId = Number(req.params.id);

    if (!directorId) {
      return res.status(400).json({
        success: false,
        message: "Invalid director ID."
      });
    }

    const result = await getCompaniesByDirector(directorId);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Director companies error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch director companies."
    });
  }
}
