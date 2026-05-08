import {
  getCompanyDetails,
  getAllCompanies
} from "../services/databaseService.js";

export async function listCompanies(req, res) {
  try {
    const companies = await getAllCompanies();

    return res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error("List companies error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies."
    });
  }
}

export async function companyDetails(req, res) {
  try {
    const companyId = Number(req.params.id);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID."
      });
    }

    const result = await getCompanyDetails(companyId);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Company details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details."
    });
  }
}