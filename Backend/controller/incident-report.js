const { UnauthorizedError, BadRequestError } = require('../errors');
const IncidentReport = require('../model/Incident-reports');
const ScheduleTask = require('../model/Schedule-task')
const Resident = require('../model/Resident')
const Personnel = require('../model/Personnel')

const createReports = async (req, res) => {
  const { type, location, urgency_level, description, reported_issue_status, connection_id } = req.body;
  const user = req.user;

  console.log('req.user:', req.user);

  // ✅ Fix: Correct role checking
  if (user.role !== 'meter_reader' && user.role !== 'resident' && user.role !== 'admin' && user.role !== 'secretary') {
    throw new UnauthorizedError('Only meter readers and residents can create reports.');
  }

  // ✅ Validate required fields
  if (!type || !description) {
    throw new BadRequestError('Please provide all required fields: type and description.');
  }

  // For broken meter issues, location is the meter number, for regular incidents it's required
  if (type !== 'Broken Meter' && !location) {
    throw new BadRequestError('Please provide location for this incident type.');
  }

  // ✅ Determine reporter model based on user role and get their record ID
  let reported_by_model, reported_by_id;

  if (user.role === 'resident') {
    reported_by_model = 'Resident';
    // Find resident by user_id
    const resident = await Resident.findOne({ user_id: user.userId });
    reported_by_id = resident ? resident._id : user.userId;
  } else {
    reported_by_model = 'Personnel';
    // Find personnel by user_id
    const personnel = await Personnel.findOne({ user_id: user.userId });
    reported_by_id = personnel ? personnel._id : user.userId;
  }

  // ✅ Create the report
  const reportData = {
    type,
    description,
    reported_issue_status: reported_issue_status || 'Pending',
    reported_by: reported_by_id,
    reported_by_model: reported_by_model
  };

  // Add optional fields
  if (location) reportData.location = location;
  if (urgency_level) reportData.urgency_level = urgency_level;
  if (connection_id) reportData.connection_id = connection_id;

  const report = await IncidentReport.create(reportData);

  // ✅ Update connection status to disconnected if broken meter
  if (type === 'Broken Meter' && connection_id) {
    const WaterConnection = require('../model/WaterConnection');
    await WaterConnection.findByIdAndUpdate(
      connection_id,
      { connection_status: 'disconnected' },
      { new: true }
    );
  }

  // ✅ Respond with success
  res.status(201).json({
    success: true,
    message: 'Report created successfully.',
    data: report,
  });
};
 
const getReports = async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  if (!['meter_reader', 'resident', 'admin', 'secretary', 'maintenance'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  try {
    console.log('🔍 Fetching reports for user:', { 
      userId: user.userId,
      role: user.role,
  
    });
    let filter = {};
    if (user.role === 'resident') {
      filter = {
        reported_by: user.userId,
        reported_by_model: 'Resident'
      };
    } else if (user.role === 'meter_reader') {
      filter = {
        reported_by: user.userId,
        reported_by_model: 'Personnel'
      };
      };
    

    console.log('📋 Query filter:', filter);




    const reports = await IncidentReport.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    console.log(`✅ Found ${reports.length} unscheduled reports`);

    // ✅ Get task and assignment information for each report
    const reportIds = reports.map(r => r._id);
    const tasks = await ScheduleTask.find({ report_id: { $in: reportIds } })
      .populate('assigned_personnel', 'name first_name last_name')
      .lean();

    // Create a map of report_id to task info
    const taskMap = {};
    tasks.forEach(task => {
      if (task.report_id) {
        taskMap[task.report_id.toString()] = {
          task_status: task.task_status,
          assigned_personnel: task.assigned_personnel?.name ||
                            (task.assigned_personnel?.first_name && task.assigned_personnel?.last_name
                              ? `${task.assigned_personnel.first_name} ${task.assigned_personnel.last_name}`
                              : null)
        };
      }
    });

    // ✅ Manually populate reported_by with ONLY the full name

    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        if (report.reported_by) {
          try {
            const originalUserId = report.reported_by;
            console.log('🔍 Looking for reporter with user ID:', originalUserId);
            let reporterInfo = null;
            if (report.reported_by_model === 'Resident') {
              // Try different field names - GET ALL FIELDS to see what's there
              reporterInfo = await Resident.findOne({ user: originalUserId }).lean();
              
              if (!reporterInfo) {
                reporterInfo = await Resident.findOne({ user_id: originalUserId }).lean();
              }
              
              if (!reporterInfo) {
                reporterInfo = await Resident.findOne({ userId: originalUserId }).lean();
              }
              if (!reporterInfo) {
                reporterInfo = await Resident.findById(originalUserId).lean();
              }
              console.log('✅ Full Resident document:', reporterInfo);
            } else if (report.reported_by_model === 'Personnel' || report.reported_by_model === 'meter_reader') {
              reporterInfo = await Personnel.findOne({ user: originalUserId }).lean();
              
              if (!reporterInfo) {
                reporterInfo = await Personnel.findOne({ user_id: originalUserId }).lean();
              }
              
              if (!reporterInfo) {
                reporterInfo = await Personnel.findOne({ userId: originalUserId }).lean();
              }
              if (!reporterInfo) {
                reporterInfo = await Personnel.findById(originalUserId).lean();
              }
              console.log('✅ Full Personnel document:', reporterInfo);
            }
            // ✅ Try different name fields
            if (reporterInfo) {
              const name = reporterInfo.name || 
                          reporterInfo.full_name || 
                          reporterInfo.fullName ||
                          (reporterInfo.first_name && reporterInfo.last_name 
                            ? `${reporterInfo.first_name} ${reporterInfo.last_name}`
                            : null) ||
                          (reporterInfo.firstName && reporterInfo.lastName 
                            ? `${reporterInfo.firstName} ${reporterInfo.lastName}`
                            : null);
              
              if (name) {
                report.reported_by = name;
                console.log('✅ Set reported_by to:', name);
              } else {
                report.reported_by = 'Unknown';
                console.warn(`⚠️ Resident found but no name field. Fields:`, Object.keys(reporterInfo));
              }
            } else {
              report.reported_by = 'Unknown';
              console.warn(`⚠️ No ${report.reported_by_model} found for user ID: ${originalUserId}`);
            }
          } catch (err) {
            console.error('❌ Error populating reported_by:', err);
            report.reported_by = 'Unknown';
          }
        }

        // Add task and assignment information to the report
        const taskInfo = taskMap[report._id.toString()];
        if (taskInfo) {
          report.task_status = taskInfo.task_status;
          report.assigned_personnel = taskInfo.assigned_personnel;
        }

        return report;
      })
    );
    res.status(200).json({
      success: true,
      reports: populatedReports,
      count: populatedReports.length
    });
  } catch (error) {
    console.error('❌ Error fetching incident reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident reports',
      error: error.message
    });
  }
};


// Update incident status 
const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { reported_issue_status, resolution_notes } = req.body;
    const user = req.user;

    if (!['admin', 'secretary', 'maintenance'].includes(user.role)) {
      return res.status(403).json({ message: 'Not authorized to update incidents' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(reported_issue_status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const incident = await IncidentReport.findByIdAndUpdate(
      id,
      { 
        reported_issue_status,
        resolution_notes,
        resolved_at: reported_issue_status === 'Resolved' ? new Date() : null
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Incident status updated',
      incident
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all incidents for admin
const getAllIncidents = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let filter = {};
    if (status && status !== 'all') filter.reported_issue_status = status;
    if (priority && priority !== 'all') filter.urgency_level = priority;

    const incidents = await IncidentReport.find(filter)
      .populate({
        path: 'connection_id',
        select: 'meter_no zone resident_id',
        populate: {
          path: 'resident_id',
          select: 'full_name',
          model: 'Resident'
        }
      })
      .populate({
        path: 'reported_by',
        select: 'first_name last_name full_name name'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Populate reporter names for manual population (for legacy data that might not have proper references)
    const populatedIncidents = await Promise.all(
      incidents.map(async (incident) => {
        // Handle reported_by population
        if (incident.reported_by) {
          if (typeof incident.reported_by === 'object') {
            // Already populated - extract name
            let name = 'Unknown';
            if (incident.reported_by_model === 'Resident') {
              name = incident.reported_by.full_name || 'Unknown';
            } else {
              // Personnel - construct name from first_name and last_name
              name = incident.reported_by.name ||
                     `${incident.reported_by.first_name || ''} ${incident.reported_by.last_name || ''}`.trim() ||
                     'Unknown';
            }
            incident.reported_by = name;
          } else {
            // Fallback - should not happen with proper population
            incident.reported_by = 'Unknown';
          }
        }

        // Handle connection resident name for meter issues
        if (incident.connection_id && incident.connection_id.resident_id) {
          incident.resident_name = incident.connection_id.resident_id.full_name || 'Unknown';
        }

        return incident;
      })
    );

    res.status(200).json({
      success: true,
      incidents: populatedIncidents,
      count: populatedIncidents.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReports, getReports, updateIncidentStatus, getAllIncidents }; 