import { db } from '@/db';
import { medicalHistory } from '@/db/schema';

async function main() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const now = new Date();

    const sampleMedicalHistory = [
        {
            user_id: 'test-user-001',
            condition_name: 'Hypertension',
            diagnosis_date: '2020-03-15',
            status: 'chronic',
            notes: 'Stage 1 hypertension, controlled with medication and lifestyle changes',
            created_at: threeYearsAgo.toISOString(),
            updated_at: now.toISOString(),
        },
        {
            user_id: 'test-user-001',
            condition_name: 'Seasonal Allergies',
            diagnosis_date: '2018-05-22',
            status: 'active',
            notes: 'Allergic to pollen and dust mites. Symptoms worsen in spring and fall',
            created_at: fiveYearsAgo.toISOString(),
            updated_at: now.toISOString(),
        },
        {
            user_id: 'test-user-001',
            condition_name: 'Ankle Sprain (Left)',
            diagnosis_date: '2022-08-10',
            status: 'resolved',
            notes: 'Grade 2 sprain from sports injury. Fully healed after 8 weeks of physical therapy',
            created_at: oneYearAgo.toISOString(),
            updated_at: now.toISOString(),
        }
    ];

    await db.insert(medicalHistory).values(sampleMedicalHistory);
    
    console.log('✅ Medical history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});