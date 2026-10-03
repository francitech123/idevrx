import { connectDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { Category } from '../models/Category.js';
import { slugify } from '../utils/slug.js';

const CATEGORIES = [
  { name: 'Robotics', description: 'Robots, actuators, kinematics, control.' },
  { name: 'Electronics', description: 'Circuits, PCB design, analog and digital electronics.' },
  { name: 'Embedded Systems', description: 'Microcontrollers, firmware, real-time systems.' },
  { name: 'Mechanical', description: 'Mechanisms, structural design, manufacturing.' },
  { name: 'Programming', description: 'Software, algorithms, tooling, and languages.' },
  { name: 'AI & Machine Learning', description: 'Models, training, inference, applications.' },
  { name: '3D Design & Fabrication', description: 'CAD, printing, CNC, laser cutting.' },
  { name: 'IoT & Automation', description: 'Connected devices, sensors, home and industrial automation.' },
  { name: 'Computer Vision', description: 'Imaging, detection, recognition, tracking.' },
  { name: 'Mechatronics', description: 'Integration of mechanical, electronic, and software systems.' },
];

async function main() {
  await connectDb();
  logger.info('Seeding categories...');

  let created = 0;
  let updated = 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const slug = slugify(cat.name);
    const result = await Category.updateOne(
      { slug },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          order: i + 1,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) created++;
    else updated++;
  }

  logger.info({ created, updated, total: CATEGORIES.length }, 'Categories seeded');
  process.exit(0);
}

main().catch((err) => {
  logger.fatal({ err }, 'Seed failed');
  process.exit(1);
});
