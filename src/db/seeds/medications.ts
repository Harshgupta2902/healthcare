import { db } from '@/db';
import { medications } from '@/db/schema';

async function main() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const oneAndHalfYearsAgo = new Date();
    oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 18);
    
    const currentDate = new Date();

    const sampleMedications = [
        {
            userId: 'test-user-001',
            medicationName: 'Lisinopril',
            dosage: '10 mg',
            frequency: 'Once daily',
            startDate: '2020-03-20',
            endDate: null,
            prescribingDoctor: 'Dr. Emily Roberts, MD',
            notes: 'Take in the morning with food. Monitor blood pressure weekly',
            isActive: true,
            createdAt: threeYearsAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
        {
            userId: 'test-user-001',
            medicationName: 'Cetirizine (Zyrtec)',
            dosage: '10 mg',
            frequency: 'Once daily during allergy season',
            startDate: '2023-03-01',
            endDate: null,
            prescribingDoctor: 'Dr. Michael Chen, MD',
            notes: 'Take before bedtime to minimize drowsiness',
            isActive: true,
            createdAt: oneYearAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
        {
            userId: 'test-user-001',
            medicationName: 'Vitamin D3',
            dosage: '2000 IU',
            frequency: 'Once daily',
            startDate: '2022-11-15',
            endDate: null,
            prescribingDoctor: 'Dr. Emily Roberts, MD',
            notes: 'Take with a meal for better absorption. Vitamin D levels were low in last blood test',
            isActive: true,
            createdAt: oneAndHalfYearsAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
        {
            userId: 'test-user-001',
            medicationName: 'Ibuprofen',
            dosage: '400 mg',
            frequency: 'Three times daily as needed',
            startDate: '2022-08-10',
            endDate: '2022-09-30',
            prescribingDoctor: 'Dr. Sarah Martinez, PT',
            notes: 'Used during ankle sprain recovery. Completed treatment',
            isActive: false,
            createdAt: oneAndHalfYearsAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
    ];

    await db.insert(medications).values(sampleMedications);
    
    console.log('✅ Medications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});