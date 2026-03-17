export interface Doctor {
  id: string
  full_name: string
  email: string
  phone?: string
  specialization?: string
  license_number?: string
  hospital?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  doctor_id: string
  full_name: string
  phone: string
  email?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  blood_type?: string
  conditions?: string[]
  allergies?: string[]
  notes?: string
  status: 'active' | 'inactive' | 'critical'
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  patient_id: string
  doctor_id: string
  title: string
  description?: string
  file_url?: string
  report_type: 'lab' | 'xray' | 'mri' | 'general' | 'prescription'
  analysis?: string
  created_at: string
  patient?: Patient
}

export interface Reminder {
  id: string
  patient_id: string
  doctor_id: string
  title: string
  message: string
  reminder_type: 'medicine' | 'appointment' | 'checkup' | 'custom'
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  scheduled_at: string
  is_recurring: boolean
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  send_whatsapp: boolean
  send_sms: boolean
  created_at: string
  patient?: Patient
}

export interface Message {
  id: string
  patient_id: string
  doctor_id: string
  content: string
  channel: 'whatsapp' | 'sms' | 'email'
  direction: 'outbound' | 'inbound'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sent_at?: string
  created_at: string
  patient?: Patient
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  title: string
  description?: string
  appointment_type: 'checkup' | 'followup' | 'emergency' | 'diagnosis' | 'procedure'
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at: string
  patient?: Patient
}

export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingReminders: number
  messagesSentToday: number
  criticalPatients: number
}
