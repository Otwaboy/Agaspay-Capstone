const mongoose = require('mongoose');
const ScheduleTask = require('../model/Schedule-task');
const Assignment = require('../model/Assignment');
require('dotenv').config();

/**
 * Migration script to populate assigned_personnel field in ScheduleTask documents
 * This field was missing from the schema and needs to be populated from Assignment records
 */
async function migrateAssignedPersonnel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all assignments
    const assignments = await Assignment.find({}).lean();
    console.log(`\n📋 Found ${assignments.length} assignments to process`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Update each schedule task with its assigned personnel
    for (const assignment of assignments) {
      try {
        const task = await ScheduleTask.findById(assignment.task_id);

        if (!task) {
          console.log(`⚠️  Task ${assignment.task_id} not found, skipping...`);
          skipped++;
          continue;
        }

        // Update the assigned_personnel field
        task.assigned_personnel = assignment.assigned_to;
        await task.save();

        console.log(`✅ Updated task ${task._id} with personnel ${assignment.assigned_to}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating task ${assignment.task_id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('\n✨ Migration complete!');

    // Verify the migration
    const tasksWithPersonnel = await ScheduleTask.find({ assigned_personnel: { $exists: true, $ne: null } });
    console.log(`\n🔍 Verification: ${tasksWithPersonnel.length} tasks now have assigned_personnel field`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the migration
migrateAssignedPersonnel();
