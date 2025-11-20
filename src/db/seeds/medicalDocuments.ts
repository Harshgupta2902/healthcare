import { db } from '@/db';
import { medicalDocuments } from '@/db/schema';

async function main() {
    const now = new Date();
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oneAndHalfYearsAgo = new Date(now);
    oneAndHalfYearsAgo.setFullYear(oneAndHalfYearsAgo.getFullYear() - 1);
    oneAndHalfYearsAgo.setMonth(oneAndHalfYearsAgo.getMonth() - 6);

    const sampleDocuments = [
        {
            userId: 'test-user-001',
            documentName: 'Annual Blood Work Results 2024',
            documentType: 'report',
            fileUrl: 'https://example.com/documents/blood-test-2024.pdf',
            fileSize: 245678,
            uploadDate: '2024-01-15',
            notes: 'Complete blood count, lipid panel, and vitamin D levels. All values within normal range except slightly low vitamin D',
            createdAt: sixtyDaysAgo.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'test-user-001',
            documentName: 'Lisinopril Prescription Renewal',
            documentType: 'prescription',
            fileUrl: 'https://example.com/documents/prescription-lisinopril.pdf',
            fileSize: 89234,
            uploadDate: '2024-02-20',
            notes: '90-day supply prescription for blood pressure medication',
            createdAt: thirtyDaysAgo.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            userId: 'test-user-001',
            documentName: 'Left Ankle X-Ray',
            documentType: 'xray',
            fileUrl: 'https://example.com/documents/ankle-xray-2022.jpg',
            fileSize: 1456789,
            uploadDate: '2022-08-11',
            notes: 'X-ray taken after ankle injury. No fractures detected, confirmed grade 2 sprain',
            createdAt: oneAndHalfYearsAgo.toISOString(),
            updatedAt: now.toISOString(),
        }
    ];

    await db.insert(medicalDocuments).values(sampleDocuments);
    
    console.log('✅ Medical documents seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});