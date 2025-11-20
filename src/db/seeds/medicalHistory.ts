import { db } from '@/db';
import { medicalHistory } from '@/db/schema';

async function main() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const currentDate = new Date();

    const sampleMedicalHistory = [
        {
            userId: 'test-user-001',
            conditionName: 'Hypertension',
            diagnosisDate: '2020-03-15',
            status: 'chronic',
            notes: 'Stage 1 hypertension, controlled with medication and lifestyle changes',
            createdAt: threeYearsAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
        {
            userId: 'test-user-001',
            conditionName: 'Seasonal Allergies',
            diagnosisDate: '2018-05-22',
            status: 'active',
            notes: 'Allergic to pollen and dust mites. Symptoms worsen in spring and fall',
            createdAt: fiveYearsAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
        {
            userId: 'test-user-001',
            conditionName: 'Ankle Sprain (Left)',
            diagnosisDate: '2022-08-10',
            status: 'resolved',
            notes: 'Grade 2 sprain from sports injury. Fully healed after 8 weeks of physical therapy',
            createdAt: oneYearAgo.toISOString(),
            updatedAt: currentDate.toISOString(),
        },
    ];

    await db.insert(medicalHistory).values(sampleMedicalHistory);
    
    console.log('✅ Medical history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});