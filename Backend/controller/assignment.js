const Assignment = require('../model/Assignment');
const ScheduleTask = require('../model/Schedule-task');
const Personnel = require('../model/Personnel');
const IncidentReport = require('../model/Incident-reports');
const { StatusCodes } = require('http-status-codes');

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

    // ✅ Update task status to 'Assigned'
    await ScheduleTask.findByIdAndUpdate(task_id, { status: 'Assigned' });

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
 * Purpose: Get all assignments (tasks with assigned personnel)
 * Access: Secretary and Admin
 * 
 * Returns:
 * - List of all assignments with task and personnel details
 */
const getAssignments = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Only secretary and admin can view all assignments
    if (!['secretary', 'admin'].includes(user.role)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    // ✅ Fetch all assignments with populated details
    const assignments = await Assignment.find()
      .populate({
        path: 'task_id',
        populate: {
          path: 'report_id',
        },
      })
      .populate({
        path: 'assigned_to',
        select: 'first_name last_name contact_no role assigned_zone',
      })
      .sort({ createdAt: -1 });

    // ✅ Format assignments for frontend
    const formattedAssignments = assignments.map(assignment => {
      const task = assignment.task_id;
      const personnel = assignment.assigned_to;
      const report = task?.report_id;

      return {
        id: assignment._id,
        task: {
          id: task?._id,
          type: task?.task_type,
          location: task?.location,
          scheduled_date: task?.scheduled_date,
          time_slot: task?.time_slot,
          priority: task?.priority,
          status: task?.status,
          notes: task?.notes,
          report_id: report?._id,
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
    });

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
      status: { $in: ['Scheduled', 'Assigned'] }, // Include only active tasks
    })
      .populate('report_id')
      .sort({ scheduled_date: 1, time_slot: 1 });

    // ✅ Format tasks for frontend
    const formattedTasks = unassignedTasks.map(task => {
      const report = task.report_id;

      return {
        id: task._id,
        type: task.task_type,
        location: task.location,
        scheduled_date: task.scheduled_date,
        time_slot: task.time_slot,
        priority: task.priority,
        status: task.status,
        notes: task.notes,
        report: {
          id: report?._id,
          type: report?.type,
          description: report?.description,
          urgency_level: report?.urgency_level,
        },
        created_at: task.createdAt,
      };
    });

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
 * Controller: getMaintenancePersonnel
 * 
 * Purpose: Get all maintenance personnel available for assignment
 * Access: Secretary only
 * 
 * Returns:
 * - List of maintenance personnel with their details
 */
const getMaintenancePersonnel = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Only secretary can view maintenance personnel
    if (user.role !== 'secretary') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized. Only secretary can view maintenance personnel.',
      });
    }

    // ✅ Find all maintenance personnel
    const maintenancePersonnel = await Personnel.find({ role: 'maintenance' })
      .select('first_name last_name contact_no assigned_zone')
      .sort({ first_name: 1 });

    // ✅ Format personnel for frontend
    const formattedPersonnel = maintenancePersonnel.map(person => ({
      id: person._id,
      name: `${person.first_name} ${person.last_name}`,
      contact_no: person.contact_no,
      assigned_zone: person.assigned_zone,
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      personnel: formattedPersonnel,
      count: formattedPersonnel.length,
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

    // ✅ Reset task status to 'Scheduled'
    await ScheduleTask.findByIdAndUpdate(assignment.task_id, {
      status: 'Scheduled',
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

module.exports = {
  createAssignment,
  getAssignments,
  getUnassignedTasks,
  getMaintenancePersonnel,
  updateAssignment,
  deleteAssignment,
};
