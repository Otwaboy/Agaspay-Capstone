const mongoose = require('mongoose');
const ScheduleTask = require('../model/Schedule-task');
const Assignment = require('../model/Assignment');
const Personnel = require('../model/Personnel');
require('dotenv').config();

async function checkTasks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check ScheduleTasks
    const tasks = await ScheduleTask.find({}).lean();
    console.log(`📋 Found ${tasks.length} ScheduleTask documents`);

    if (tasks.length > 0) {
      console.log('\n🔍 Sample task:');
      console.log(JSON.stringify(tasks[0], null, 2));
    }

    // Check Assignments
    const assignments = await Assignment.find({}).lean();
    console.log(`\n👥 Found ${assignments.length} Assignment documents`);

    if (assignments.length > 0) {
      console.log('\n🔍 Sample assignment:');
      console.log(JSON.stringify(assignments[0], null, 2));
    }

    // Check Personnel
    const personnel = await Personnel.find({ role: 'maintenance' }).lean();
    console.log(`\n🔧 Found ${personnel.length} Maintenance Personnel`);

    if (personnel.length > 0) {
      console.log('\n🔍 Personnel IDs:');
      personnel.forEach(p => {
        console.log(`   - ${p.first_name} ${p.last_name}: ${p._id}`);
      });
    }

    // Check if tasks have assigned_personnel field
    const tasksWithPersonnel = tasks.filter(t => t.assigned_personnel);
    console.log(`\n✅ Tasks with assigned_personnel: ${tasksWithPersonnel.length}/${tasks.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkTasks();
