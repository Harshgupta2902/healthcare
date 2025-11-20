import { db } from '@/db';
import { medications } from '@/db/schema';

async function main() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const oneAndHalfYearsAgo = new Date();
    oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 18);
    
    const currentTimestamp = new Date().toISOString();

    const sampleMedications = [
        {
            user_id: 'test-user-001',
            medication_name: 'Lisinopril',
            dosage: '10 mg',
            frequency: 'Once daily',
            start_date: '2020-03-20',
            end_date: null,
            prescribing_doctor: 'Dr. Emily Roberts, MD',
            notes: 'Take in the morning with food. Monitor blood pressure weekly',
            is_active: 1,
            created_at: threeYearsAgo.toISOString(),
            updated_at: currentTimestamp,
        },
        {
            user_id: 'test-user-001',
            medication_name: 'Cetirizine (Zyrtec)',
            dosage: '10 mg',
            frequency: 'Once daily during allergy season',
            start_date: '2023-03-01',
            end_date: null,
            prescribing_doctor: 'Dr. Michael Chen, MD',
            notes: 'Take before bedtime to minimize drowsiness',
            is_active: 1,
            created_at: oneYearAgo.toISOString(),
            updated_at: currentTimestamp,
        },
        {
            user_id: 'test-user-001',
            medication_name: 'Vitamin D3',
            dosage: '2000 IU',
            frequency: 'Once daily',
            start_date: '2022-11-15',
            end_date: null,
            prescribing_doctor: 'Dr. Emily Roberts, MD',
            notes: 'Take with a meal for better absorption. Vitamin D levels were low in last blood test',
            is_active: 1,
            created_at: oneAndHalfYearsAgo.toISOString(),
            updated_at: currentTimestamp,
        },
        {
            user_id: 'test-user-001',
            medication_name: 'Ibuprofen',
            dosage: '400 mg',
            frequency: 'Three times daily as needed',
            start_date: '2022-08-10',
            end_date: '2022-09-30',
            prescribing_doctor: 'Dr. Sarah Martinez, PT',
            notes: 'Used during ankle sprain recovery. Completed treatment',
            is_active: 0,
            created_at: oneAndHalfYearsAgo.toISOString(),
            updated_at: currentTimestamp,
        }
    ];

    await db.insert(medications).values(sampleMedications);
    
    console.log('✅ Medications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});