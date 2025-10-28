// Reports generation controller
const Billing = require('../model/Billing');
const Payment = require('../model/Payment');
const WaterConnection = require('../model/WaterConnection');
const MeterReading = require('../model/Meter-reading');
const IncidentReport = require('../model/Incident-reports');
const Resident = require('../model/Resident');

// Generate revenue report
const generateRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const payments = await Payment.find({
      ...filter,
      payment_status: 'confirmed'
    }).populate('resident_id', 'first_name last_name');
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const paymentsByMethod = {};
    
    payments.forEach(p => {
      const method = p.payment_method || 'Cash';
      paymentsByMethod[method] = (paymentsByMethod[method] || 0) + p.amount_paid;
    });
    
    res.status(200).json({
      success: true,
      report: {
        totalRevenue,
        totalPayments: payments.length,
        paymentsByMethod,
        payments
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate consumption report
const generateConsumptionReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const filter = {};
    if (month && year) {
      filter.reading_period = `${year}-${String(month).padStart(2, '0')}`;
    }
    
    const readings = await MeterReading.find(filter)
      .populate('resident_id', 'first_name last_name zone purok');
    
    const totalConsumption = readings.reduce((sum, r) => sum + (r.consumption || 0), 0);
    const averageConsumption = readings.length > 0 ? totalConsumption / readings.length : 0;
    
    // Group by zone
    const byZone = {};
    readings.forEach(r => {
      const zone = r.resident_id?.zone || 'Unknown';
      if (!byZone[zone]) {
        byZone[zone] = { count: 0, total: 0 };
      }
      byZone[zone].count++;
      byZone[zone].total += r.consumption || 0;
    });
    
    res.status(200).json({
      success: true,
      report: {
        totalConsumption,
        averageConsumption,
        totalReadings: readings.length,
        byZone,
        readings
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate billing summary report
const generateBillingReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const filter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.billing_date = { $gte: startDate, $lte: endDate };
    }
    
    const bills = await Billing.find(filter)
      .populate('resident_id', 'first_name last_name account_number');
    
    const totalBilled = bills.reduce((sum, b) => sum + b.total_amount, 0);
    const paidBills = bills.filter(b => b.payment_status === 'paid');
    const pendingBills = bills.filter(b => b.payment_status === 'pending');
    const overdueBills = bills.filter(b => b.payment_status === 'pending' && new Date(b.due_date) < new Date());
    
    const totalPaid = paidBills.reduce((sum, b) => sum + b.total_amount, 0);
    const totalPending = pendingBills.reduce((sum, b) => sum + b.total_amount, 0);
    const totalOverdue = overdueBills.reduce((sum, b) => sum + b.total_amount, 0);
    
    const collectionRate = bills.length > 0 ? (paidBills.length / bills.length) * 100 : 0;
    
    res.status(200).json({
      success: true,
      report: {
        totalBilled,
        totalPaid,
        totalPending,
        totalOverdue,
        collectionRate: collectionRate.toFixed(2),
        totalBills: bills.length,
        paidCount: paidBills.length,
        pendingCount: pendingBills.length,
        overdueCount: overdueBills.length,
        bills
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate user analytics report
const generateUserAnalyticsReport = async (req, res) => {
  try {
    const totalResidents = await Resident.countDocuments();
    const activeConnections = await WaterConnection.countDocuments({ connection_status: 'active' });
    const pendingConnections = await WaterConnection.countDocuments({ connection_status: 'pending_installation' });
    const disconnectedConnections = await WaterConnection.countDocuments({ connection_status: 'disconnected' });
    
    // New connections this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const newConnectionsThisMonth = await WaterConnection.countDocuments({
      createdAt: { $gte: currentMonth }
    });
    
    // Connections by zone
    const connections = await WaterConnection.find().populate('resident_id', 'zone purok');
    const byZone = {};
    connections.forEach(c => {
      const zone = c.resident_id?.zone || 'Unknown';
      byZone[zone] = (byZone[zone] || 0) + 1;
    });
    
    res.status(200).json({
      success: true,
      report: {
        totalResidents,
        activeConnections,
        pendingConnections,
        disconnectedConnections,
        newConnectionsThisMonth,
        connectionsByZone: byZone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate incidents summary report
const generateIncidentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const incidents = await IncidentReport.find(filter);
    
    const byStatus = {
      Pending: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0
    };
    
    const byType = {};
    const byPriority = {
      low: 0,
      medium: 0,
      high: 0
    };
    
    incidents.forEach(i => {
      byStatus[i.reported_issue_status] = (byStatus[i.reported_issue_status] || 0) + 1;
      byType[i.type] = (byType[i.type] || 0) + 1;
      byPriority[i.urgency_level] = (byPriority[i.urgency_level] || 0) + 1;
    });
    
    res.status(200).json({
      success: true,
      report: {
        totalIncidents: incidents.length,
        byStatus,
        byType,
        byPriority,
        incidents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateRevenueReport,
  generateConsumptionReport,
  generateBillingReport,
  generateUserAnalyticsReport,
  generateIncidentReport
};
