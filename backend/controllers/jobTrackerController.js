const Job = require("../models/JobTracker");
const mongoose = require("mongoose");

// GET /api/jobs - Get all jobs for authenticated user
const getAllJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, search, page = 1, limit = 50 } = req.query;

    // Build query
    let query = { userId };

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
          hasNextPage: page * limit < totalJobs,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// GET /api/jobs/:id - Get single job by ID
const getJobById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const job = await Job.findOne({ _id: id, userId }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// POST /api/jobs - Create new job
const createJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      company,
      location,
      salary,
      status = "applied",
      priority = "medium",
      jobUrl,
      description,
      appliedDate,
      recruiterName,
      contactEmail,
      contactPhone,
      notes,
      aiSuggestions = [],
    } = req.body;

    // Validate required fields
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "Title and company are required fields",
      });
    }

    // Create new job
    const newJob = new Job({
      userId,
      title: title.trim(),
      company: company.trim(),
      location: location?.trim(),
      salary: salary?.trim(),
      status,
      priority,
      jobUrl: jobUrl?.trim(),
      description: description?.trim(),
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      recruiterName: recruiterName?.trim(),
      contactEmail: contactEmail?.trim(),
      contactPhone: contactPhone?.trim(),
      notes: notes?.trim(),
      aiSuggestions: aiSuggestions.filter(
        (suggestion) => suggestion && suggestion.trim(),
      ),
    });

    const savedJob = await newJob.save();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: { job: savedJob },
    });
  } catch (error) {
    console.error("Create job error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// PUT /api/jobs/:id - Update job
const updateJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    // Find job first to ensure it belongs to user
    const existingJob = await Job.findOne({ _id: id, userId });
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const {
      title,
      company,
      location,
      salary,
      status,
      priority,
      jobUrl,
      description,
      appliedDate,
      recruiterName,
      contactEmail,
      contactPhone,
      notes,
      aiSuggestions,
    } = req.body;

    // Validate required fields
    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "Title and company are required fields",
      });
    }

    // Update fields
    const updateData = {
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || "",
      salary: salary?.trim() || "",
      status: status || existingJob.status,
      priority: priority || existingJob.priority,
      jobUrl: jobUrl?.trim() || "",
      description: description?.trim() || "",
      appliedDate: appliedDate
        ? new Date(appliedDate)
        : existingJob.appliedDate,
      recruiterName: recruiterName?.trim() || "",
      contactEmail: contactEmail?.trim() || "",
      contactPhone: contactPhone?.trim() || "",
      notes: notes?.trim() || "",
      aiSuggestions: aiSuggestions
        ? aiSuggestions.filter((suggestion) => suggestion && suggestion.trim())
        : existingJob.aiSuggestions,
    };

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: { job: updatedJob },
    });
  } catch (error) {
    console.error("Update job error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// PATCH /api/jobs/:id/status - Update job status (for drag & drop)
const updateJobStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    // Validate status
    const validStatuses = [
      "applied",
      "interview",
      "in-progress",
      "offer",
      "rejected",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: id, userId },
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      data: { job: updatedJob },
    });
  } catch (error) {
    console.error("Update job status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update job status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// DELETE /api/jobs/:id - Delete job
const deleteJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const deletedJob = await Job.findOneAndDelete({ _id: id, userId });

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: { deletedJobId: id },
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// GET /api/jobs/stats - Get job application statistics
const getJobStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Job.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format stats for frontend
    const formattedStats = {
      total: 0,
      applied: 0,
      interview: 0,
      "in-progress": 0,
      offer: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    // Calculate success rate
    const successRate =
      formattedStats.total > 0
        ? Math.round((formattedStats.offer / formattedStats.total) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: formattedStats,
        successRate,
      },
    });
  } catch (error) {
    console.error("Get job stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// POST /api/jobs/:id/ai-suggestions - Add AI suggestions to job
const addAISuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { suggestions } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    // Validate suggestions
    if (
      !suggestions ||
      !Array.isArray(suggestions) ||
      suggestions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Suggestions array is required and cannot be empty",
      });
    }

    const job = await Job.findOne({ _id: id, userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Filter and add new suggestions
    const validSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion && typeof suggestion === "string" && suggestion.trim(),
    );

    if (validSuggestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid suggestions provided",
      });
    }

    // Add new suggestions to existing ones
    job.aiSuggestions = [...job.aiSuggestions, ...validSuggestions];
    await job.save();

    res.status(200).json({
      success: true,
      message: "AI suggestions added successfully",
      data: { job },
    });
  } catch (error) {
    console.error("Add AI suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add AI suggestions",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getJobStats,
  addAISuggestions,
};
