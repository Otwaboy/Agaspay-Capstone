const { UnauthorizedError, BadRequestError } = require('../errors');
const IncidentReport = require('../model/Incident-reports');

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

module.exports = { createReports };