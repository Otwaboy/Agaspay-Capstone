const mongoose = require('mongoose');
const ScheduleTask = require('../model/Schedule-task');
const WaterConnection = require('../model/WaterConnection');
const Resident = require('../model/Resident');
require('dotenv').config();

/**
 * Script to update existing Meter Installation tasks with location information
 * from their associated resident records
 */
async function updateMeterInstallationLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all Meter Installation tasks without location
    const tasks = await ScheduleTask.find({
      schedule_type: 'Meter Installation',
      $or: [
        { location: { $exists: false } },
        { location: null },
        { location: '' }
      ]
    }).populate('connection_id');

    console.log(`📋 Found ${tasks.length} Meter Installation tasks without location`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const task of tasks) {
      if (!task.connection_id) {
        console.log(`⚠️  Task ${task._id} has no connection_id - skipping`);
        skippedCount++;
        continue;
      }

      // Find the resident associated with this connection
      const resident = await Resident.findOne({
        water_connection_id: task.connection_id._id
      });

      if (!resident) {
        console.log(`⚠️  No resident found for connection ${task.connection_id._id} - skipping`);
        skippedCount++;
        continue;
      }

      // Update task location
      const location = `Zone ${resident.zone}, Purok ${resident.purok}`;
      task.location = location;
      await task.save();

      console.log(`✅ Updated task ${task._id}: ${location}`);
      updatedCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⚠️  Skipped: ${skippedCount}`);
    console.log(`   📋 Total: ${tasks.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
updateMeterInstallationLocations();
