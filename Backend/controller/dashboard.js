// Dashboard statistics controller
const Resident = require('../model/Resident');
const Personnel = require('../model/Personnel');
const WaterConnection = require('../model/WaterConnection');
const Billing = require('../model/Billing');
const Payment = require('../model/Payment');
const IncidentReport = require('../model/Incident-reports');
const ScheduleTask = require('../model/Schedule-task');
const MeterReading = require('../model/Meter-reading');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;

    // Total users/residents
    const totalResidents = await Resident.countDocuments();
    
    // Total personnel
    const totalPersonnel = await Personnel.countDocuments();
    
    // Water connections stats
    const totalConnections = await WaterConnection.countDocuments();
    const activeConnections = await WaterConnection.countDocuments({ connection_status: 'active' });
    const pendingConnections = await WaterConnection.countDocuments({ connection_status: 'pending_installation' });
    const disconnectedConnections = await WaterConnection.countDocuments({ connection_status: 'disconnected' });
    
    // Billing stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyBills = await Billing.find({
      billing_date: { $gte: currentMonth }
    });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { payment_status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount_paid' } } }
    ]);
    
    const pendingPayments = await Billing.aggregate([
      { $match: { payment_status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    
    const overduePayments = await Billing.aggregate([
      { 
        $match: { 
          payment_status: 'pending',
          due_date: { $lt: new Date() }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    // Delinquent accounts
    const delinquentAccounts = await Billing.countDocuments({ is_delinquent: true });
    
    // Incident reports stats
    const openIncidents = await IncidentReport.countDocuments({ 
      reported_issue_status: { $in: ['Pending', 'In Progress'] }
    });
    
    const resolvedIncidents = await IncidentReport.countDocuments({ 
      reported_issue_status: 'Resolved' 
    });
    
    // Tasks stats
    const pendingTasks = await ScheduleTask.countDocuments({ status: 'Pending' });
    const completedTasks = await ScheduleTask.countDocuments({ status: 'Completed' });
    const inProgressTasks = await ScheduleTask.countDocuments({ status: 'In Progress' });
    
    // Recent transactions (last 10 payments)
    const recentTransactions = await Payment.find()
      .populate('resident_id', 'first_name last_name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Recent incidents
    const recentIncidents = await IncidentReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        users: {
          totalResidents,
          totalPersonnel,
          activeUsers: totalResidents + totalPersonnel
        },
        connections: {
          total: totalConnections,
          active: activeConnections,
          pending: pendingConnections,
          disconnected: disconnectedConnections
        },
        financial: {
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingPayments: pendingPayments[0]?.total || 0,
          overduePayments: overduePayments[0]?.total || 0,
          delinquentAccounts,
          monthlyBills: monthlyBills.length
        },
        incidents: {
          open: openIncidents,
          resolved: resolvedIncidents,
          total: openIncidents + resolvedIncidents
        },
        tasks: {
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          total: pendingTasks + inProgressTasks + completedTasks
        }
      },
      recentTransactions,
      recentIncidents
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get secretary financial statistics
const getSecretaryFinancialStats = async (req, res) => {
  try {
    const user = req.user;

    // Only secretary, treasurer, or admin can access
    if (!['secretary', 'treasurer', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // 1. Total Revenue - sum of all confirmed payments
    const totalRevenueResult = await Payment.aggregate([
      { $match: { payment_status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount_paid' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2. Monthly Collection - sum of confirmed payments for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyCollectionResult = await Payment.aggregate([
      {
        $match: {
          payment_status: 'confirmed',
          payment_date: {
            $gte: currentMonth,
            $lt: nextMonth
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount_paid' } } }
    ]);
    const monthlyCollection = monthlyCollectionResult[0]?.total || 0;

    // 3. Outstanding Balances - sum of all unpaid/partial/overdue billing balances
    const outstandingBalancesResult = await Billing.aggregate([
      {
        $match: {
          status: { $in: ['unpaid', 'partial', 'overdue'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$balance' }
        }
      }
    ]);
    const outstandingBalances = outstandingBalancesResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        monthlyCollection,
        outstandingBalances
      }
    });
  } catch (error) {
    console.error('Error fetching secretary financial stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getDashboardStats, getSecretaryFinancialStats };
