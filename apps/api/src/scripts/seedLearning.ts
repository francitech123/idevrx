import { connectDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { User } from '../models/User.js';
import { LearningPath } from '../models/LearningPath.js';
import { LearningLesson } from '../models/LearningLesson.js';
import { Course } from '../models/Course.js';
import { CourseLesson } from '../models/CourseLesson.js';
import { slugify } from '../utils/slug.js';

const PATHS = [
  {
    title: 'Robotics Foundations',
    description: 'Sensors, actuators, microcontrollers, motion and control: the engineering thinking behind practical robots.',
    category: 'Robotics',
    lessons: [
      'Robotics systems overview',
      'Microcontrollers and GPIO',
      'Motors and motor drivers',
      'Sensors and feedback',
      'Your first autonomous system',
      'Final assessment',
    ],
  },
  {
    title: 'Embedded Systems with ESP32',
    description: 'Design connected systems using the ESP32, sensors and real-world interfaces.',
    category: 'Embedded',
    lessons: [
      'ESP32 fundamentals',
      'Digital and analog inputs',
      'I2C and SPI',
      'Sensors and data acquisition',
      'Wi-Fi and MQTT',
      'Final assessment',
    ],
  },
  {
    title: 'Practical Electronics',
    description: 'Components, circuits, measurement, prototyping and troubleshooting, in a clear route from basics to builds.',
    category: 'Electronics',
    lessons: [
      'Voltage, current and resistance',
      'Components',
      'Breadboarding',
      'Multimeters and measurement',
      'Power supplies',
      'Final assessment',
    ],
  },
];

const COURSES = [
  {
    title: 'Robotics Foundations',
    description: 'A structured introduction to practical robotics: sensors, actuators, microcontrollers and motion control.',
    category: 'Robotics',
    lessons: [
      'Robotics systems overview',
      'Microcontrollers and GPIO',
      'Motors and motor drivers',
      'Sensors and feedback',
      'Your first autonomous system',
      'Final assessment',
    ],
  },
  {
    title: 'Embedded Systems with ESP32',
    description: 'Design connected systems using the ESP32, sensors and real-world interfaces.',
    category: 'Embedded',
    lessons: [
      'ESP32 fundamentals',
      'Digital and analog inputs',
      'I2C and SPI',
      'Sensors and data acquisition',
      'Wi-Fi and MQTT',
      'Final assessment',
    ],
  },
  {
    title: 'Practical Electronics',
    description: 'Components, circuits, measurement, prototyping and troubleshooting, in a clear route from basics to builds.',
    category: 'Electronics',
    lessons: [
      'Voltage, current and resistance',
      'Components',
      'Breadboarding',
      'Multimeters and measurement',
      'Power supplies',
      'Final assessment',
    ],
  },
];

async function main() {
  await connectDb();
  logger.info('Seeding learning paths and courses...');

  const admin = await User.findOne({ roles: { $in: ['admin', 'ceo'] } });
  if (!admin) {
    logger.error('No admin user found. Grant a user admin role first.');
    process.exit(1);
  }

  for (let i = 0; i < PATHS.length; i++) {
    const def = PATHS[i];
    const slug = slugify(def.title);
    const path = await LearningPath.findOneAndUpdate(
      { slug },
      {
        $set: {
          slug,
          title: def.title,
          description: def.description,
          category: def.category,
          order: i + 1,
          published: true,
          createdBy: admin._id,
        },
      },
      { upsert: true, new: true }
    );

    for (let j = 0; j < def.lessons.length; j++) {
      const lessonTitle = def.lessons[j];
      await LearningLesson.findOneAndUpdate(
        { pathId: path._id, order: j + 1 },
        {
          $set: {
            pathId: path._id,
            order: j + 1,
            title: lessonTitle,
            description: '',
          },
        },
        { upsert: true }
      );
    }
  }

  for (let i = 0; i < COURSES.length; i++) {
    const def = COURSES[i];
    const slug = slugify(def.title);
    const course = await Course.findOneAndUpdate(
      { slug },
      {
        $set: {
          slug,
          title: def.title,
          description: def.description,
          category: def.category,
          order: i + 1,
          published: true,
          createdBy: admin._id,
        },
      },
      { upsert: true, new: true }
    );

    for (let j = 0; j < def.lessons.length; j++) {
      const lessonTitle = def.lessons[j];
      await CourseLesson.findOneAndUpdate(
        { courseId: course._id, order: j + 1 },
        {
          $set: {
            courseId: course._id,
            order: j + 1,
            title: lessonTitle,
            description: '',
          },
        },
        { upsert: true }
      );
    }
  }

  logger.info({ paths: PATHS.length, courses: COURSES.length }, 'Seed complete');
  process.exit(0);
}

main().catch((err) => {
  logger.fatal({ err }, 'Seed failed');
  process.exit(1);
});
