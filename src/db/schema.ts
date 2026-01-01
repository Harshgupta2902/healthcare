import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("client"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Newsletter subscribers table
export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  subscribedAt: text('subscribed_at').notNull(),
  status: text('status').notNull().default('active'),
});

// Medical dashboard tables
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  bloodType: text('blood_type'),
  height: text('height'),
  weight: text('weight'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelationship: text('emergency_contact_relationship'),
  profilePhotoUrl: text('profile_photo_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const medicalHistory = sqliteTable('medical_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  conditionName: text('condition_name').notNull(),
  diagnosisDate: text('diagnosis_date'),
  status: text('status').notNull().default('active'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const medications = sqliteTable('medications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  medicationName: text('medication_name').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  prescribingDoctor: text('prescribing_doctor'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const medicalDocuments = sqliteTable('medical_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  documentName: text('document_name').notNull(),
  documentType: text('document_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  uploadDate: text('upload_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Professional profiles table
export const professionalProfiles = sqliteTable('professional_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  specialization: text('specialization').notNull(),
  licenseNumber: text('license_number').notNull(),
  bio: text('bio'),
  yearsOfExperience: integer('years_of_experience'),
  consultationFee: integer('consultation_fee'),
  phone: text('phone'),
  profilePhotoUrl: text('profile_photo_url'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Professional qualifications table
export const professionalQualifications = sqliteTable('professional_qualifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  professionalId: text('professional_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  degree: text('degree').notNull(),
  institution: text('institution').notNull(),
  year: integer('year'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Appointments table
export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: text('client_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  professionalId: text('professional_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  appointmentType: text('appointment_type').notNull(),
  status: text('status').notNull().default('pending'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  notes: text('notes'),
  meetingUrl: text('meeting_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Professional availability table
export const professionalAvailability = sqliteTable('professional_availability', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  professionalId: text('professional_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Professional payments table
export const professionalPayments = sqliteTable('professional_payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  professionalId: text('professional_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'),
  paymentMethod: text('payment_method'),
  transactionId: text('transaction_id'),
  paidAt: text('paid_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Consultation requests table
export const consultationRequests = sqliteTable('consultation_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: text('client_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  professionalId: text('professional_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  requestType: text('request_type').notNull(),
  status: text('status').notNull().default('pending'),
  message: text('message'),
  preferredDate: text('preferred_date'),
  preferredTime: text('preferred_time'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});