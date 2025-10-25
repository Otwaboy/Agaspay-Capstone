const { UnauthorizedError, BadRequestError } = require('../errors');
const IncidentReport = require('../model/Incident-reports');
const ScheduleTask = require('../model/Schedule-task')
const Resident = require('../model/Resident')
const Personnel = require('../model/Personnel')

const createReports = async (req, res) => {
  const { type, location, urgency_level, description, reported_issue_status } = req.body;
  const user = req.user;

  console.log('req.user:', req.user);

  // ✅ Fix: Correct role checking
  if (user.role !== 'meter_reader' && user.role !== 'resident' && user.role !== 'admin' && user.role !== 'secretary') {
    throw new UnauthorizedError('Only meter readers and residents can create reports.');
  }

  // ✅ Validate required fields
  if (!type || !location || !description) {
    throw new BadRequestError('Please provide all required fields: type, location, and description.');
  }

  // ✅ Determine reporter model based on user role
  const reported_by_model = user.role === 'resident' ? 'Resident' : 'Personnel';

  // ✅ Create the report
  const report = await IncidentReport.create({
    type,
    location,
    description, 
    urgency_level,
    reported_issue_status: reported_issue_status || 'Pending',
    reported_by: user.userId,
    reported_by_model: user.role === 'resident' ? 'Resident' : 'meter_reader'
  });

  // ✅ Respond with success
  res.status(201).json({
    success: true,
    message: 'Incident report created successfully.',
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
      email: user.email
    });
    let filter = {};
    if (user.role === 'resident') {
      filter = {
        reported_by: user.userId,
        reported_by_model: 'Resident'
      };
    } else if (user.role === 'meter_reader') {
      filter = {
        $or: [
          { assigned_to: user.userId },
          { assigned_to: null },
          { assigned_to: { $exists: false } }
        ]
      };
    }
    console.log('📋 Query filter:', filter);
    // ✅ Get all report IDs that have scheduled tasks
    const scheduledReportIds = await ScheduleTask.find({
      report_id: { $exists: true, $ne: null }
    })
      .distinct('report_id')
      .lean();
    console.log(`🗓️ Found ${scheduledReportIds.length} reports with scheduled tasks`);
    // ✅ Exclude reports that already have scheduled tasks
    filter._id = { $nin: scheduledReportIds };
    console.log('📋 Updated filter (excluding scheduled reports):', filter);
    // ✅ Fetch incident reports
    const reports = await IncidentReport.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    console.log(`✅ Found ${reports.length} unscheduled reports`);
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


module.exports = { createReports, getReports};