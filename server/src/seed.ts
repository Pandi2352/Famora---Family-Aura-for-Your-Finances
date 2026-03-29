import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { uuidPlugin } from './utils';
import { generateUUID } from './utils/uuid';

config(); // load .env

// Apply UUID plugin globally
mongoose.plugin(uuidPlugin);

// ── Schemas (inline to avoid NestJS DI) ──

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    isTemporaryPassword: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

const FamilySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
  },
  { timestamps: true },
);

const FamilyMemberSchema = new mongoose.Schema(
  {
    familyId: { type: String, required: true },
    userId: { type: String, required: true },
    relationship: { type: String, default: 'other' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);
const Family = mongoose.model('Family', FamilySchema);
const FamilyMember = mongoose.model('FamilyMember', FamilyMemberSchema);

// ── Seed Config ──

const SEED_USER = {
  name: process.env.SEED_USER_NAME || 'Pandi',
  email: (process.env.SEED_USER_EMAIL || 'pandi@famora.app').toLowerCase(),
  password: process.env.SEED_USER_PASSWORD || 'pandi123',
  familyName: process.env.SEED_FAMILY_NAME || "Pandi's Family",
};

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/famora';
  console.log(`Connecting to ${uri}...`);
  await mongoose.connect(uri);
  console.log('Connected.\n');

  // Check if user already exists
  const existing = await User.findOne({ email: SEED_USER.email });
  if (existing) {
    console.log(`User "${SEED_USER.email}" already exists. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  // Create user
  const hashedPassword = await bcrypt.hash(SEED_USER.password, 12);
  const userId = generateUUID();
  const user = await User.create({
    _id: userId,
    name: SEED_USER.name,
    email: SEED_USER.email,
    password: hashedPassword,
    isTemporaryPassword: false,
  });
  console.log(`Created user: ${user.name} (${user.email})`);

  // Create family
  const familyId = generateUUID();
  const family = await Family.create({
    _id: familyId,
    name: SEED_USER.familyName,
    ownerId: userId,
  });
  console.log(`Created family: ${family.name}`);

  // Add user as family member
  await FamilyMember.create({
    _id: generateUUID(),
    familyId,
    userId,
    relationship: 'other',
  });
  console.log(`Added ${user.name} to ${family.name}`);

  console.log('\n── Seed complete ──');
  console.log(`Email:    ${SEED_USER.email}`);
  console.log(`Password: ${SEED_USER.password}`);
  console.log('');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
