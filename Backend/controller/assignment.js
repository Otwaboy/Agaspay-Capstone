const Assignment = require('../model/Assignment');
const ScheduleTask = require('../model/Schedule-task');
const Personnel = require('../model/Personnel');
const IncidentReport = require('../model/Incident-reports');
const { StatusCodes } = require('http-status-codes');

/**
 * Helper function: Check and update overdue tasks
 *
 * Purpose: Automatically mark tasks as "Pending" if they are past their scheduled date/time
 * and still have status "Assigned"
 */
const checkAndUpdateOverdueTasks = async () => {
  try {
    // Get current date and time in Philippine Time (UTC+8)
    const now = new Date();
    const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    console.log(`[Overdue Check] Current Philippine Time: ${philippineTime.toISOString()}`);

    // Find all tasks that are "Assigned" status
    const assignedTasks = await ScheduleTask.find({ task_status: 'Assigned' });

    for (const task of assignedTasks) {
      // Combine schedule_date and schedule_time to create a full datetime
      const scheduleDate = new Date(task.schedule_date);
      const [hours, minutes] = task.schedule_time.split(':');

      // Create the scheduled datetime in UTC
      const scheduledDateTime = new Date(scheduleDate);
      scheduledDateTime.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Compare: if current time is past the scheduled time, mark as Pending
      if (philippineTime > scheduledDateTime) {
        await ScheduleTask.findByIdAndUpdate(task._id, { task_status: 'Pending' });
        console.log(`[Overdue] Task ${task._id} marked as Pending (was scheduled for ${scheduledDateTime.toISOString()})`);
      }
    }
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
  }
};

/**
 * Controller: createAssignment
 * 
 * Purpose: Assign a scheduled task to a maintenance personnel
 * Access: Secretary only
 *  
 * Request Body:
 * - task_id: ID of the scheduled task
 * - assigned_to: ID of the maintenance personnel
 * 
 * Returns: 
 * - Created assignment with populated task and personnel details
 */
const createAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { task_id, assigned_to } = req.body;

    // ✅ Only secretary can create assignments
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can create assignments.',
      });
    }

    // ✅ Validate required fields
    if (!task_id || !assigned_to) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Task ID and assigned personnel are required',
      });
    }

    // ✅ Check if task exists
    const task = await ScheduleTask.findById(task_id);
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Scheduled task not found',
      });
    }

    // ✅ Check if personnel exists and is maintenance role
    const personnel = await Personnel.findById(assigned_to);
    if (!personnel) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Personnel not found',
      });
    }

    if (personnel.role !== 'maintenance') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Can only assign tasks to maintenance personnel',
      });
    }

    // ✅ Check if personnel account is archived
    if (personnel.archive_status === 'archived') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot assign tasks to archived personnel',
      });
    }

    // ✅ Check if task is already assigned
    const existingAssignment = await Assignment.findOne({ task_id });
    if (existingAssignment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Task is already assigned to another personnel',
      });
    }

    // ✅ Create assignment
    const assignment = await Assignment.create({
      task_id,
      assigned_to,
    });

    // ✅ Update task status to 'Scheduled' (assigned and ready)
    await ScheduleTask.findByIdAndUpdate(task_id, { task_status: 'Assigned' });

    // ✅ Populate assignment details
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate({
        path: 'task_id',
        populate: {
          path: 'report_id',
        },
      })
      .populate('assigned_to');

    console.log('✅ Assignment created:', assignment._id);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Task assigned successfully',
      assignment: populatedAssignment,
    });

  } catch (error) {
    console.error('🔥 createAssignment error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message,
    });
  }
};

/**
 * Controller: getAssignments
 * 
 * Purpose: Get assignments based on user role
 * Access: Secretary, Admin, and Maintenance
 * 
 * Behavior:
 * - Secretary & Admin: Get ALL assignments
 * - Maintenance: Get only their assigned tasks
 * 
 * Returns:
 * - List of assignments with task and personnel details
 */
const getAssignments = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Check and update overdue tasks before fetching assignments
    await checkAndUpdateOverdueTasks();

    // ✅ Allow secretary, admin, and maintenance to access
    if (!['secretary', 'admin', 'maintenance'].includes(user.role)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized access',
      });
    }
    let assignmentQuery = {};
    // ✅ If maintenance, filter by their personnel ID
    if (user.role === 'maintenance') {
      // Find the personnel record for this logged-in user
      const personnel = await Personnel.findOne({ user_id: user.userId });
      
      if (!personnel) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Personnel record not found for this user',
        });
      }
      // Filter assignments to only show tasks assigned to this personnel
      assignmentQuery = { assigned_to: personnel._id };
      console.log(`🔧 Maintenance user ${user.userId} filtering by personnel ${personnel._id}`);
    }
    // ✅ Fetch assignments (all for secretary/admin, filtered for maintenance)
    const assignments = await Assignment.find(assignmentQuery)
      .populate({
        path: 'task_id',
        populate: [
          { path: 'report_id' },
          {
            path: 'connection_id',
            populate: { path: 'resident_id', select: 'zone purok' }
          }
        ],
      })
      .populate({
        path: 'assigned_to',
        select: 'first_name last_name contact_no role assigned_zone',
      })
      .sort({ createdAt: -1 });

    // ✅ Format assignments for frontend
    const formattedAssignments = await Promise.all(assignments.map(async (assignment) => {
      const task = assignment.task_id;
      const personnel = assignment.assigned_to;
      const report = task?.report_id;

      // ✅ If task has no location and is a Meter Installation, get from populated resident
      let taskLocation = task?.location || report?.location;

      if (!taskLocation && task?.schedule_type === 'Meter Installation' && task?.connection_id?.resident_id) {
        const resident = task.connection_id.resident_id;

        if (resident?.zone && resident?.purok) {
          taskLocation = `Zone ${resident.zone}, Purok ${resident.purok}`;
          console.log(`✅ Found resident location: ${taskLocation}`);
        }
      }

      return {
        id: assignment._id,
        task: {
          id: task?._id,
          type: report?.type || task?.schedule_type,
          task_type: task?.task_type,
          title: task?.title,
          description: task?.description,
          priority: task?.priority,
          urgency_lvl: report?.urgency_level,
          schedule_date: task?.schedule_date,
          schedule_time: task?.schedule_time,
          task_status: task?.task_status,
          connection_id: task?.connection_id,
          scheduled_by: task?.scheduled_by,
          report_id: report?._id,
          location: taskLocation || 'N/A',
        },
        personnel: {
          id: personnel?._id,
          name: `${personnel?.first_name} ${personnel?.last_name}`,
          contact_no: personnel?.contact_no,
          role: personnel?.role,
          assigned_zone: personnel?.assigned_zone,
        },
        assigned_at: assignment.createdAt,
      };
    }));
    res.status(StatusCodes.OK).json({
      success: true,
      assignments: formattedAssignments,
      count: formattedAssignments.length,
    });
  } catch (error) {
    console.error('🔥 getAssignments error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message,
    });
  }
};

/**
 * Controller: getUnassignedTasks
 * 
 * Purpose: Get all scheduled tasks that haven't been assigned yet
 * Access: Secretary only
 * 
 * Returns:
 * - List of scheduled tasks without assignments
 */
const getUnassignedTasks = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Check and update overdue tasks before fetching
    await checkAndUpdateOverdueTasks();

    // ✅ Only secretary can view unassigned tasks
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can view unassigned tasks.',
      });
    }

    // ✅ Get all assigned task IDs
    const assignedTaskIds = await Assignment.find().distinct('task_id');

    // ✅ Find scheduled tasks that are not in the assigned list
    const unassignedTasks = await ScheduleTask.find({
      _id: { $nin: assignedTaskIds },
      task_status: 'Unassigned', // Only unassigned tasks
    })
      .populate('report_id')
      .populate({
        path: 'connection_id',
        populate: { path: 'resident_id', select: 'zone purok' }
      })
      .sort({ schedule_date: 1, schedule_time: 1 });

    // ✅ Format tasks for frontend
    const formattedTasks = await Promise.all(unassignedTasks.map(async (task) => {
      const report = task.report_id;

      // ✅ If task has no location and is a Meter Installation, get from populated resident
      let taskLocation = task.location || report?.location;

      if (!taskLocation && task.schedule_type === 'Meter Installation' && task.connection_id?.resident_id) {
        const resident = task.connection_id.resident_id;

        if (resident?.zone && resident?.purok) {
          taskLocation = `Zone ${resident.zone}, Purok ${resident.purok}`;
        }
      }

      return {
        id: task._id,
        task_type: task.task_type,
        title: task.title,
        description: task.description,
        priority: task.priority,
        schedule_date: task.schedule_date,
        schedule_time: task.schedule_time,
        task_status: task.task_status,
        connection_id: task.connection_id,
        scheduled_by: task.scheduled_by,
        location: taskLocation || 'N/A',
        report: report ? {
          id: report._id,
          type: report.type,
          description: report.description,
          location: report.location,
          urgency_level: report.urgency_level,
        } : null,
        created_at: task.createdAt,
      };
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      tasks: formattedTasks,
      count: formattedTasks.length,
    });

  } catch (error) {
    console.error('🔥 getUnassignedTasks error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch unassigned tasks',
      error: error.message,
    });
  }
};

/**
 * Helper Function: checkTimeConflict
 * 
 * Purpose: Check if a time slot overlaps with another
 * 
 * Time format: "HH:MM", "HH:MM AM/PM", or "HH:MM - HH:MM" (with optional AM/PM)
 * 
 * Returns: true if there's a conflict, false otherwise
 */
const checkTimeConflict = (time1, time2) => {
  const parseTime = (timeStr) => {
    // Remove leading/trailing whitespace
    timeStr = timeStr.trim();
    
    // Check if time has AM/PM
    const hasAmPm = /AM|PM/i.test(timeStr);
    
    if (hasAmPm) {
      // Handle 12-hour format: "09:00 AM" or "02:30 PM"
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) {
        console.error('Invalid time format:', timeStr);
        return 0; // Default to midnight if parsing fails
      }
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3].toUpperCase();
      
      // Convert to 24-hour format
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes;
    } else {
      // Handle 24-hour format: "09:00" or "14:30"
      const parts = timeStr.split(':');
      if (parts.length !== 2) {
        console.error('Invalid time format:', timeStr);
        return 0;
      }
      
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time values:', timeStr);
        return 0;
      }
      
      return hours * 60 + minutes;
    }
  };

  const parseTimeRange = (timeStr) => {
    const parts = timeStr.split('-').map(s => s.trim());
    
    if (parts.length === 2) {
      // Range format: "09:00 - 10:00" or "09:00 AM - 10:00 AM"
      return {
        start: parseTime(parts[0]),
        end: parseTime(parts[1]),
      };
    } else {
      // Single time: "09:00" - assume 30 minute duration
      const start = parseTime(parts[0]);
      return {
        start: start,
        end: start + 30,
      };
    }
  };

  try {
    const range1 = parseTimeRange(time1);
    const range2 = parseTimeRange(time2);

    // Check if ranges overlap
    const hasConflict = (range1.start < range2.end && range1.end > range2.start);
    
    if (hasConflict) {
      console.log(`⚠️ Time conflict detected: ${time1} overlaps with ${time2}`);
    }
    
    return hasConflict;
  } catch (error) {
    console.error('Error checking time conflict:', error);
    return false; // Assume no conflict if parsing fails
  }
};

/**
 * Controller: getMaintenancePersonnel
 * 
 * Purpose: Get all maintenance personnel with availability status for a specific task
 * Access: Secretary only
 * 
 * Query Parameters (optional):
 * - schedule_date: Date of the task (YYYY-MM-DD)
 * - schedule_time: Time of the task (HH:MM or HH:MM - HH:MM)
 * 
 * Returns:
 * - List of maintenance personnel with their details and availability status
 */
const getMaintenancePersonnel = async (req, res) => {
  try {
    const user = req.user;
    const { schedule_date, schedule_time } = req.query;

    // ✅ Only secretary can view maintenance personnel
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can view maintenance personnel.',
      });
    }

    // ✅ Find all maintenance personnel (exclude archived)
    const maintenancePersonnel = await Personnel.find({
      role: 'maintenance',
      $or: [
        { archive_status: { $exists: false } },
        { archive_status: null },
        { archive_status: { $ne: 'archived' } }
      ]
    })
      .select('first_name last_name contact_no assigned_zone')
      .sort({ first_name: 1 });

    // ✅ Check availability if schedule_date and schedule_time are provided
    let personnelWithAvailability = [];

    if (schedule_date && schedule_time) {
      // Get all assignments for the specified date
      const assignmentsOnDate = await Assignment.find()
        .populate({
          path: 'task_id',
          match: {
            schedule_date: new Date(schedule_date),
          },
        })
        .populate('assigned_to');

      // Filter out null task_id (tasks that didn't match the date)
      const validAssignments = assignmentsOnDate.filter(a => a.task_id !== null);

      // Map personnel to check conflicts
      personnelWithAvailability = maintenancePersonnel.map(person => {
        // Find assignments for this person on the specified date
        const personAssignments = validAssignments.filter(
          a => a.assigned_to && a.assigned_to._id.toString() === person._id.toString()
        );

        // Check for time conflicts
        let hasConflict = false;
        let conflictingTasks = [];

        for (const assignment of personAssignments) {
          const taskTime = assignment.task_id.schedule_time;
          if (checkTimeConflict(schedule_time, taskTime)) {
            hasConflict = true;
            conflictingTasks.push({
              time: taskTime,
              type: assignment.task_id.task_type,
            });
          }
        }

        return {
          id: person._id,
          name: `${person.first_name} ${person.last_name}`,
          contact_no: person.contact_no,
          assigned_zone: person.assigned_zone,
          isAvailable: !hasConflict,
          conflictingTasks: hasConflict ? conflictingTasks : [],
          tasksOnDate: personAssignments.length,
        };
      });
    } else {
      // No date/time provided, just return basic personnel info
      personnelWithAvailability = maintenancePersonnel.map(person => ({
        id: person._id,
        name: `${person.first_name} ${person.last_name}`,
        contact_no: person.contact_no,
        assigned_zone: person.assigned_zone,
        isAvailable: true, // No date specified, assume available
        conflictingTasks: [],
        tasksOnDate: 0,
      }));
    }

    res.status(StatusCodes.OK).json({
      success: true,
      personnel: personnelWithAvailability,
      count: personnelWithAvailability.length,
      checked_date: schedule_date || null,
      checked_time: schedule_time || null,
    });

  } catch (error) {
    console.error('🔥 getMaintenancePersonnel error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch maintenance personnel',
      error: error.message,
    });
  }
};

/**
 * Controller: updateAssignment
 * 
 * Purpose: Reassign a task to a different maintenance personnel
 * Access: Secretary only
 * 
 * Request Params:
 * - id: Assignment ID
 * 
 * Request Body:
 * - assigned_to: New personnel ID
 * 
 * Returns:
 * - Updated assignment
 */
const updateAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { assigned_to } = req.body;

    // ✅ Only secretary can update assignments
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can update assignments.',
      });
    }

    // ✅ Validate personnel ID
    if (!assigned_to) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Personnel ID is required',
      });
    }

    // ✅ Check if personnel exists and is maintenance role
    const personnel = await Personnel.findById(assigned_to);
    if (!personnel) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Personnel not found',
      });
    }

    if (personnel.role !== 'maintenance') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Can only assign tasks to maintenance personnel',
      });
    }

    // ✅ Check if personnel account is archived
    if (personnel.archive_status === 'archived') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot assign tasks to archived personnel',
      });
    }

    // ✅ Update assignment
    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { assigned_to },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'task_id',
        populate: {
          path: 'report_id',
        },
      })
      .populate('assigned_to');

    if (!assignment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    console.log('✅ Assignment updated:', assignment._id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment,
    });

  } catch (error) {
    console.error('🔥 updateAssignment error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message,
    });
  }
};

/**
 * Controller: deleteAssignment
 * 
 * Purpose: Remove an assignment and reset task status
 * Access: Secretary only
 * 
 * Request Params:
 * - id: Assignment ID
 * 
 * Returns:
 * - Success message
 */
const deleteAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // ✅ Only secretary can delete assignments
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can delete assignments.',
      });
    }

    // ✅ Find and delete assignment
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // ✅ Reset task status to 'Unassigned'
    await ScheduleTask.findByIdAndUpdate(assignment.task_id, {
      task_status: 'Unassigned',
    });

    console.log('✅ Assignment deleted:', id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Assignment deleted successfully',
    });

  } catch (error) {
    console.error('🔥 deleteAssignment error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message,
    });
  }
};

/**
 * Controller: getPersonnelAvailability
 *
 * Purpose: Check availability of all maintenance personnel for a specific date and time
 * Access: Secretary only
 *
 * Query Parameters:
 * - date: Schedule date (YYYY-MM-DD)
 * - time: Schedule time (HH:MM)
 *
 * Returns:
 * - List of personnel with availability status (available/busy)
 */
const getPersonnelAvailability = async (req, res) => {
  try {
    const user = req.user;
    const { date, time } = req.query;

    // ✅ Only secretary can check availability
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can check availability.',
      });
    }

    // ✅ Validate required parameters
    if (!date || !time) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Date and time are required',
      });
    }

    // ✅ Get all active maintenance personnel (exclude archived)
    const allPersonnel = await Personnel.find({
      role: 'maintenance',
      $or: [
        { archive_status: { $exists: false } },
        { archive_status: null },
        { archive_status: { $ne: 'archived' } }
      ]
    });

    // ✅ Check availability for each personnel
    const personnelWithAvailability = await Promise.all(
      allPersonnel.map(async (personnel) => {
        // Check if personnel has assignment at this date and time
        const existingAssignment = await ScheduleTask.findOne({
          assigned_personnel: personnel._id,
          schedule_time: time,
        });

        let isAvailable = true;
        if (existingAssignment && existingAssignment.schedule_date) {
          const existingDate = new Date(existingAssignment.schedule_date);
          const targetDate = new Date(date);

          // Compare dates
          if (existingDate.getFullYear() === targetDate.getFullYear() &&
              existingDate.getMonth() === targetDate.getMonth() &&
              existingDate.getDate() === targetDate.getDate()) {
            isAvailable = false;
          }
        }

        return {
          id: personnel._id,
          name: `${personnel.first_name} ${personnel.last_name}`,
          contact_no: personnel.contact_no,
          assigned_zone: personnel.assigned_zone,
          available: isAvailable,
          status: isAvailable ? 'available' : 'busy',
        };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      personnel: personnelWithAvailability,
      date,
      time,
    });

  } catch (error) {
    console.error('🔥 getPersonnelAvailability error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to check personnel availability',
      error: error.message,
    });
  }
};

/**
 * Controller: rescheduleAssignment
 *
 * Purpose: Reschedule an existing assignment to a new date, time, and/or personnel
 * Access: Secretary only
 *
 * Request Body:
 * - assignment_id: ID of the assignment to reschedule
 * - new_date: New schedule date (YYYY-MM-DD)
 * - new_time: New schedule time (HH:MM)
 * - new_personnel_id: (Optional) New personnel ID
 *
 * Returns:
 * - Updated assignment details
 */
const rescheduleAssignment = async (req, res) => {
  try {
    const user = req.user;
    const { assignment_id, new_date, new_time, new_personnel_id } = req.body;

    // ✅ Only secretary can reschedule
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can reschedule assignments.',
      });
    }

    // ✅ Validate required fields
    if (!assignment_id || !new_date || !new_time) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Assignment ID, new date, and new time are required',
      });
    }

    // ✅ Find the assignment
    const assignment = await Assignment.findById(assignment_id);
    if (!assignment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // ✅ Find the associated task
    const task = await ScheduleTask.findById(assignment.task_id);
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Scheduled task not found',
      });
    }

    // ✅ If changing personnel, validate new personnel
    let targetPersonnelId = task.assigned_personnel;
    if (new_personnel_id) {
      const newPersonnel = await Personnel.findOne({
        _id: new_personnel_id,
        role: 'maintenance'
      });

      if (!newPersonnel) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'New personnel not found or not a maintenance worker',
        });
      }

      // ✅ Check if personnel account is archived
      if (newPersonnel.archive_status === 'archived') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Cannot reschedule to archived personnel',
        });
      }

      // Check if new personnel is available at the new date/time
      const conflict = await ScheduleTask.findOne({
        assigned_personnel: new_personnel_id,
        schedule_time: new_time,
        _id: { $ne: task._id }, // Exclude current task
      });

      if (conflict && conflict.schedule_date) {
        const conflictDate = new Date(conflict.schedule_date);
        const targetDate = new Date(new_date);

        if (conflictDate.getFullYear() === targetDate.getFullYear() &&
            conflictDate.getMonth() === targetDate.getMonth() &&
            conflictDate.getDate() === targetDate.getDate()) {
          return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: `Selected personnel is already assigned at ${new_time} on ${new_date}`,
          });
        }
      }

      targetPersonnelId = new_personnel_id;
    }

    // ✅ Update the task
    task.schedule_date = new Date(new_date);
    task.schedule_time = new_time;
    task.assigned_personnel = targetPersonnelId;
    await task.save();

    // ✅ Update the assignment if personnel changed
    if (new_personnel_id) {
      assignment.assigned_to = new_personnel_id;
      await assignment.save();
    }

    // ✅ Return updated assignment with populated data
    const updatedAssignment = await Assignment.findById(assignment_id)
      .populate({
        path: 'task_id',
        populate: { path: 'report_id' }
      })
      .populate('assigned_to');

    console.log('✅ Assignment rescheduled:', assignment_id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Assignment rescheduled successfully',
      assignment: updatedAssignment,
    });

  } catch (error) {
    console.error('🔥 rescheduleAssignment error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reschedule assignment',
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getUnassignedTasks,
  getMaintenancePersonnel,
  updateAssignment,
  deleteAssignment,
  getPersonnelAvailability,
  rescheduleAssignment,
};