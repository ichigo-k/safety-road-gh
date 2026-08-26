import { PrismaClient, Role, AlertSeverity } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPasswordSync(password: string): string {
  const salt = 'safety_road_gh_salt';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

async function main() {
  console.log('Seeding Safety Road GH Database with 7 main tables...');

  // Create Admin User
  const adminPassword = hashPasswordSync('Admin@123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@safetyroad.gov.gh' },
    update: {},
    create: {
      full_name: 'MTTD Road Safety Officer',
      email: 'admin@safetyroad.gov.gh',
      password_hash: adminPassword,
      phone: '+233240000001',
      role: Role.ADMIN,
      is_verified: true,
    },
  });

  // Create Demo Citizen User
  const citizenPassword = hashPasswordSync('Citizen@123456');
  const citizen = await prisma.user.upsert({
    where: { email: 'kwame.mensah@gmail.com' },
    update: {},
    create: {
      full_name: 'Kwame Mensah',
      email: 'kwame.mensah@gmail.com',
      password_hash: citizenPassword,
      phone: '+233241234567',
      role: Role.CITIZEN,
      is_verified: true,
    },
  });

  // Seed Emergency Services
  const emergencyServices = [
    {
      name: 'Ghana National Ambulance Service (Toll Free)',
      type: 'FIRE_AMBULANCE',
      phone: '193',
      address: 'Ministries, Accra',
      latitude: 5.55602,
      longitude: -0.1969,
    },
    {
      name: 'Ghana Police Service Hotline / MTTD Command',
      type: 'POLICE',
      phone: '18555',
      address: 'Police National HQ, Ring Road East, Accra',
      latitude: 5.5645,
      longitude: -0.1912,
    },
    {
      name: 'Ghana National Fire Service (HQ)',
      type: 'FIRE_AMBULANCE',
      phone: '192',
      address: 'Cantonments, Accra',
      latitude: 5.5682,
      longitude: -0.1876,
    },
    {
      name: 'Korle Bu Teaching Hospital Emergency Center',
      type: 'HOSPITAL',
      phone: '+233302665401',
      address: 'Guggisberg Avenue, Korle Bu, Accra',
      latitude: 5.5369,
      longitude: -0.2274,
    },
    {
      name: '37 Military Hospital Accident & Emergency Unit',
      type: 'HOSPITAL',
      phone: '+233302776111',
      address: 'Liberation Road, 37 Cantonments, Accra',
      latitude: 5.5878,
      longitude: -0.1831,
    },
  ];

  for (const es of emergencyServices) {
    await prisma.emergencyService.create({ data: es });
  }

  // Seed Safety Tips
  const safetyTips = [
    {
      title: 'Maintain Safe Speed Limits in Heavy Rain',
      category: 'DRIVER',
      description: 'During tropical downpours on highways like the N1 or Accra-Tema Motorway, hydroplaning risk increases drastically. Reduce speed by at least 20km/h and keep low-beam headlights on.',
      image_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800',
    },
    {
      title: 'Mandatory Crash Helmet & Reflective Gear',
      category: 'MOTORCYCLIST',
      description: 'Always wear a certified helmet securely fastened. Night riding requires high-visibility reflective vests so heavy vehicle drivers can spot motorcycle riders early.',
      image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
    },
    {
      title: 'Use Zebra Crossings & Footbridges',
      category: 'PEDESTRIAN',
      description: 'Always utilize pedestrian bridges on high-speed urban highways (e.g. N1 Highway footbridges) rather than running across multi-lane expressways.',
      image_url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=800',
    },
  ];

  for (const tip of safetyTips) {
    await prisma.safetyTip.create({ data: tip });
  }

  // Seed Accident Report
  await prisma.accidentReport.create({
    data: {
      user_id: citizen.id,
      accident_type: 'HEAD_ON_COLLISION',
      description: 'Head-on impact between two sprinter minibuses near Circle Overpass ramp. Minor injuries reported.',
      vehicle_count: 2,
      injured_count: 4,
      latitude: 5.5597,
      longitude: -0.215,
      location: 'Kwame Nkrumah Interchange, Accra',
      image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
      status: 'VERIFIED',
    },
  });

  // Seed Road Hazard
  await prisma.roadHazard.create({
    data: {
      user_id: citizen.id,
      hazard_type: 'FLOODING',
      description: 'Deep standing water across all lanes heading towards Kasoa. Compact cars unable to cross safely.',
      latitude: 5.568,
      longitude: -0.288,
      location: 'Mallam Junction, Weija Highway',
      image_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800',
      status: 'PENDING',
    },
  });

  // Seed Road Alert
  await prisma.roadAlert.create({
    data: {
      title: 'Accra-Tema Motorway Heavy Congestion Alert',
      description: 'Broken down container trailer blocking outer lane near Ashaiman flyover. Expect delays of up to 45 minutes.',
      location: 'Ashaiman Flyover, Tema Motorway',
      latitude: 5.65,
      longitude: -0.05,
      severity: AlertSeverity.HIGH,
      active: true,
    },
  });

  // Seed Notification
  await prisma.notification.create({
    data: {
      user_id: citizen.id,
      title: 'Report Verified',
      message: 'Your accident report at Kwame Nkrumah Interchange has been verified by MTTD Command.',
      type: 'STATUS_UPDATE',
      is_read: false,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
